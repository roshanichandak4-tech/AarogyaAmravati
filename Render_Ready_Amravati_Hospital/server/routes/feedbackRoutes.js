const express = require('express');
const router = express.Router();
const store = require('../data/store');

// Get feedback for a hospital
router.get('/hospital/:hospitalId', (req, res) => {
  try {
    const { hospitalId } = req.params;
    const list = store.find('feedbacks', f => f.hospitalId === hospitalId);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: list.length, feedbacks: list });
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ success: false, message: 'Server error fetching feedback.' });
  }
});

// Submit patient feedback
router.post('/', (req, res) => {
  try {
    const { hospitalId, patientName, rating, comment } = req.body;

    if (!hospitalId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Hospital ID, Rating (1-5), and Comment are required.' });
    }

    const newFeedback = store.insert('feedbacks', {
      hospitalId,
      patientName: patientName || 'Anonymous Patient',
      rating: Number(rating),
      comment
    });

    // Update hospital average rating
    const allFeedbacks = store.find('feedbacks', f => f.hospitalId === hospitalId);
    const avgRating = (allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length).toFixed(1);

    store.update('hospitals', h => h._id === hospitalId, {
      rating: parseFloat(avgRating),
      reviewCount: allFeedbacks.length
    });

    const io = req.app.get('io');
    if (io) {
      io.emit(`feedback_update_${hospitalId}`);
    }

    res.status(201).json({ success: true, message: 'Thank you for your valuable feedback!', feedback: newFeedback });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ success: false, message: 'Server error submitting feedback.' });
  }
});

module.exports = router;
