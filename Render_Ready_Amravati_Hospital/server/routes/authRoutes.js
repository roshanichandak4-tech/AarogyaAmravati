const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { JWT_SECRET, verifyAdminToken } = require('../middleware/auth');

// Register a new hospital (Directly Live & Approved)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, emergencyPhone, address, area, openingTime, closingTime, specializations, bannerUrl, photoUrl, logoUrl } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (Name, Email, Password, Phone, Address).' });
    }

    const existing = store.findOne('hospitals', h => h.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'A hospital with this email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const selectedBanner = bannerUrl || photoUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200';
    const selectedLogo = logoUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=200';

    const newHospital = store.insert('hospitals', {
      name,
      slug,
      email,
      password: hashedPassword,
      phone,
      emergencyPhone: emergencyPhone || phone,
      address,
      area: area || 'Amravati Central',
      openingTime: openingTime || '09:00 AM',
      closingTime: closingTime || '08:00 PM',
      is24Hours: true,
      isApproved: true, // Directly approved & live on public dashboard
      bannerUrl: selectedBanner,
      logoUrl: selectedLogo,
      specializations: Array.isArray(specializations) ? specializations : ['General Medicine', 'Emergency'],
      departments: ['OPD Desk 1 (General)', 'Emergency'],
      facilities: ['24x7 Emergency', 'Pharmacy', 'Pathology'],
      bloodStock: { 'A+': 10, 'B+': 10, 'O+': 10, 'AB+': 5, 'A-': 2, 'B-': 2, 'O-': 2, 'AB-': 1 },
      announcements: ['Welcome to our digital token portal!'],
      mapLink: `https://maps.google.com/?q=${encodeURIComponent(name + ' ' + address)}`,
      rating: 5.0,
      reviewCount: 1
    });

    const token = jwt.sign({ hospitalId: newHospital._id, email: newHospital.email }, JWT_SECRET, { expiresIn: '7d' });

    // Real-time broadcast to update public hospital dashboard cards immediately
    const io = req.app.get('io');
    if (io) {
      io.emit('global_hospitals_update');
    }

    const { password: _, ...hospData } = newHospital;
    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully! Your hospital card is now live on the public dashboard.',
      token,
      hospital: hospData
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during hospital registration.' });
  }
});

// Login hospital admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const hospital = store.findOne('hospitals', h => h.email.toLowerCase() === email.toLowerCase());
    if (!hospital) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Hospital email not found.' });
    }

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign({ hospitalId: hospital._id, email: hospital.email }, JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...hospData } = hospital;
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      hospital: hospData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Get current logged-in hospital profile
router.get('/me', verifyAdminToken, (req, res) => {
  const hospital = store.findOne('hospitals', h => h._id === req.admin.hospitalId);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital profile not found.' });
  }
  const { password: _, ...hospData } = hospital;
  res.json({ success: true, hospital: hospData });
});

module.exports = router;
