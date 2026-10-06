const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Memory store fallback state
let memoryStore = {
  hospitals: [],
  doctors: [],
  tokens: [],
  feedbacks: []
};

// Load initial file if exists
const loadStore = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      memoryStore = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading JSON DB store:', err.message);
  }
};

const saveStore = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving JSON DB store:', err.message);
  }
};

loadStore();

module.exports = {
  getStore: () => memoryStore,
  saveStore,
  
  // Generic collection helpers
  find: (collection, filterFn) => {
    const list = memoryStore[collection] || [];
    if (!filterFn) return list;
    return list.filter(filterFn);
  },
  
  findOne: (collection, filterFn) => {
    const list = memoryStore[collection] || [];
    return list.find(filterFn);
  },
  
  insert: (collection, item) => {
    if (!memoryStore[collection]) memoryStore[collection] = [];
    const newItem = {
      _id: item._id || 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: item.createdAt || new Date().toISOString(),
      ...item
    };
    memoryStore[collection].push(newItem);
    saveStore();
    return newItem;
  },
  
  update: (collection, filterFn, updateData) => {
    const list = memoryStore[collection] || [];
    let updated = null;
    memoryStore[collection] = list.map(item => {
      if (filterFn(item)) {
        updated = { ...item, ...updateData, updatedAt: new Date().toISOString() };
        return updated;
      }
      return item;
    });
    saveStore();
    return updated;
  },

  remove: (collection, filterFn) => {
    const list = memoryStore[collection] || [];
    memoryStore[collection] = list.filter(item => !filterFn(item));
    saveStore();
  }
};
