const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { verifyAdminToken } = require('../middleware/auth');

// Get doctors for a specific hospital (Public)
router.get('/hospital/:hospitalId', (req, res) => {
  try {
    const { hospitalId } = req.params;
    const doctors = store.find('doctors', d => d.hospitalId === hospitalId);
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ success: false, message: 'Server error fetching doctors.' });
  }
});

// Add a doctor (Admin Protected)
router.post('/', verifyAdminToken, (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { name, photoUrl, qualification, experience, department, specialization, availability } = req.body;

    if (!name || !qualification || !department) {
      return res.status(400).json({ success: false, message: 'Name, Qualification, and Department are required.' });
    }

    const newDoctor = store.insert('doctors', {
      hospitalId,
      name,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300',
      qualification,
      experience: experience || 'Consultant Specialist',
      department,
      specialization: specialization || department,
      availability: availability || 'Available'
    });

    const io = req.app.get('io');
    if (io) {
      io.emit(`doctors_update_${hospitalId}`);
    }

    res.status(201).json({ success: true, message: 'Doctor added successfully!', doctor: newDoctor });
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ success: false, message: 'Server error adding doctor.' });
  }
});

// Edit doctor profile (Admin Protected)
router.put('/:id', verifyAdminToken, (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.admin.hospitalId;

    const existing = store.findOne('doctors', d => d._id === id);
    if (!existing || existing.hospitalId !== hospitalId) {
      return res.status(403).json({ success: false, message: 'Doctor record not found or unauthorized.' });
    }

    const { name, photoUrl, qualification, experience, department, specialization, availability } = req.body;

    const updated = store.update('doctors', d => d._id === id, {
      name,
      photoUrl,
      qualification,
      experience,
      department,
      specialization,
      availability
    });

    const io = req.app.get('io');
    if (io) {
      io.emit(`doctors_update_${hospitalId}`);
    }

    res.json({ success: true, message: 'Doctor updated successfully!', doctor: updated });
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ success: false, message: 'Server error updating doctor.' });
  }
});

// Delete doctor (Admin Protected)
router.delete('/:id', verifyAdminToken, (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.admin.hospitalId;

    const existing = store.findOne('doctors', d => d._id === id);
    if (!existing || existing.hospitalId !== hospitalId) {
      return res.status(403).json({ success: false, message: 'Doctor record not found or unauthorized.' });
    }

    store.remove('doctors', d => d._id === id);

    const io = req.app.get('io');
    if (io) {
      io.emit(`doctors_update_${hospitalId}`);
    }

    res.json({ success: true, message: 'Doctor deleted successfully!' });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({ success: false, message: 'Server error deleting doctor.' });
  }
});

module.exports = router;
