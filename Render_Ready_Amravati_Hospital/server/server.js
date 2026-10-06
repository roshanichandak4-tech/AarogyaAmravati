const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

dotenv.config();

const seedData = require('./seedData');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

// Socket.io real-time connection logging
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

  socket.on('join_hospital', (hospitalId) => {
    socket.join(`hospital_${hospitalId}`);
    console.log(`Socket ${socket.id} joined room hospital_${hospitalId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Database Connection & Seeding
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amravati_hospital_db';

const initDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to MongoDB Database');
  } catch (err) {
    console.log('ℹ️ Local MongoDB service not detected. Utilizing Hybrid Persistent Memory Store.');
  }

  // Seed sample Amravati hospitals
  await seedData();
};

initDatabase();

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/tokens', require('./routes/tokenRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Serve Static Assets in production/built state
const fs = require('fs');
const possibleBuildPaths = [
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, 'client/dist'),
  path.join(process.cwd(), 'client/dist'),
  path.join(process.cwd(), 'server/client/dist')
];

let activeClientDist = possibleBuildPaths.find(p => fs.existsSync(p));

if (activeClientDist) {
  console.log(`📁 Serving client static bundle from: ${activeClientDist}`);
  app.use(express.static(activeClientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(activeClientDist, 'index.html'));
    }
  });
} else {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.send(`
        <div style="font-family: system-ui, sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: #0284c7;">🏥 Hospital Management System for Amravati API Server</h1>
          <p style="color: #475569; font-size: 18px;">Backend API & Socket.io server is running cleanly on port ${process.env.PORT || 5000}!</p>
          <p style="color: #10b981; font-weight: bold;">Real-time Socket.io active | Initial Amravati Hospitals Seeded</p>
        </div>
      `);
    }
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Amravati Hospital Management Server running at: http://localhost:${PORT}`);
});
