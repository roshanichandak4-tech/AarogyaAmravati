const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { verifyAdminToken } = require('../middleware/auth');

// Get all hospitals with public queue summary stats
router.get('/', (req, res) => {
  try {
    const { search, department, specialization, area } = req.query;

    let hospitals = store.find('hospitals');

    if (search) {
      const q = search.toLowerCase();
      hospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(q) ||
        (h.address && h.address.toLowerCase().includes(q)) ||
        (h.area && h.area.toLowerCase().includes(q)) ||
        (h.specializations && h.specializations.some(s => s.toLowerCase().includes(q))) ||
        (h.departments && h.departments.some(d => d.toLowerCase().includes(q)))
      );
    }

    if (department) {
      hospitals = hospitals.filter(h =>
        h.departments && h.departments.some(d => d.toLowerCase().includes(department.toLowerCase()))
      );
    }

    if (specialization) {
      hospitals = hospitals.filter(h =>
        h.specializations && h.specializations.some(s => s.toLowerCase().includes(specialization.toLowerCase()))
      );
    }

    if (area) {
      hospitals = hospitals.filter(h =>
        h.area && h.area.toLowerCase().includes(area.toLowerCase())
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const allTokens = store.find('tokens');

    // Attach real-time queue summaries
    const result = hospitals.map(h => {
      const { password, ...hospData } = h;
      const hTokens = allTokens.filter(t => t.hospitalId === h._id && t.date === todayStr);

      const waitingCount = hTokens.filter(t => t.status === 'Waiting').length;
      const currentCalled = hTokens.filter(t => t.status === 'Called').map(t => t.tokenNumber);
      const latestCalledToken = currentCalled.length > 0 ? Math.max(...currentCalled) : 0;

      return {
        ...hospData,
        liveQueue: {
          waitingCount,
          currentCalledToken: latestCalledToken || (hTokens.filter(t => t.status === 'Completed').length > 0 ? 'Done' : 'None'),
          estimatedWaitMinutes: waitingCount * 10
        }
      };
    });

    res.json({ success: true, count: result.length, hospitals: result });
  } catch (err) {
    console.error('Error fetching hospitals:', err);
    res.status(500).json({ success: false, message: 'Server error fetching hospitals.' });
  }
});

// Get hospital details by ID or slug
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const hospital = store.findOne('hospitals', h => h._id === idOrSlug || h.slug === idOrSlug);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const { password, ...hospData } = hospital;
    const todayStr = new Date().toISOString().split('T')[0];
    const tokens = store.find('tokens', t => t.hospitalId === hospital._id && t.date === todayStr);

    const doctors = store.find('doctors', d => d.hospitalId === hospital._id);

    // Compute live token queue state
    const waitingTokens = tokens.filter(t => t.status === 'Waiting');
    const calledTokens = tokens.filter(t => t.status === 'Called');
    const completedTokens = tokens.filter(t => t.status === 'Completed');

    const currentToken = calledTokens.length > 0 ? calledTokens[calledTokens.length - 1].tokenNumber : (completedTokens.length > 0 ? completedTokens[completedTokens.length - 1].tokenNumber : 0);
    const nextToken = waitingTokens.length > 0 ? waitingTokens[0].tokenNumber : 'None';
    const waitingCount = waitingTokens.length;
    const estimatedWaitTimeMinutes = waitingCount * 10;

    res.json({
      success: true,
      hospital: hospData,
      doctors,
      queueStats: {
        currentToken,
        nextToken,
        waitingCount,
        estimatedWaitTimeMinutes,
        totalTodayTokens: tokens.length
      }
    });
  } catch (err) {
    console.error('Error fetching hospital detail:', err);
    res.status(500).json({ success: false, message: 'Server error fetching hospital details.' });
  }
});

// Admin Update Hospital Profile (Protected)
router.post('/profile', verifyAdminToken, (req, res) => handleProfileUpdate(req, res));
router.put('/profile', verifyAdminToken, (req, res) => handleProfileUpdate(req, res));

function handleProfileUpdate(req, res) {
  try {
    const hospitalId = req.admin.hospitalId;
    const { name, phone, emergencyPhone, address, area, openingTime, closingTime, is24Hours, bannerUrl, logoUrl, specializations, departments, facilities, mapLink, bloodStock, announcements } = req.body;

    const existing = store.findOne('hospitals', h => h._id === hospitalId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Hospital not found.' });
    }

    const updatePayload = {};
    if (name) {
      updatePayload.name = name;
      updatePayload.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (phone !== undefined) updatePayload.phone = phone;
    if (emergencyPhone !== undefined) updatePayload.emergencyPhone = emergencyPhone;
    if (address !== undefined) updatePayload.address = address;
    if (area !== undefined) updatePayload.area = area;
    if (openingTime !== undefined) updatePayload.openingTime = openingTime;
    if (closingTime !== undefined) updatePayload.closingTime = closingTime;
    if (is24Hours !== undefined) updatePayload.is24Hours = is24Hours;
    if (bannerUrl !== undefined) updatePayload.bannerUrl = bannerUrl;
    if (logoUrl !== undefined) updatePayload.logoUrl = logoUrl;
    if (specializations !== undefined) updatePayload.specializations = specializations;
    if (departments !== undefined) updatePayload.departments = departments;
    if (facilities !== undefined) updatePayload.facilities = facilities;
    if (mapLink !== undefined) updatePayload.mapLink = mapLink;
    if (bloodStock !== undefined) updatePayload.bloodStock = bloodStock;
    if (announcements !== undefined) updatePayload.announcements = Array.isArray(announcements) ? announcements : (announcements ? announcements.split('\n') : []);

    const updated = store.update('hospitals', h => h._id === hospitalId, updatePayload);

    // Real-time broadcast update to all connected public & admin clients
    const io = req.app.get('io');
    if (io && updated) {
      const { password, ...hospPayload } = updated;
      io.emit(`hospital_update_${hospitalId}`, hospPayload);
      io.emit('global_hospitals_update');
    }

    const { password, ...hospData } = updated;
    res.json({ success: true, message: 'Hospital profile updated successfully!', hospital: hospData });
  } catch (err) {
    console.error('Error updating hospital profile:', err);
    res.status(500).json({ success: false, message: 'Server error updating hospital profile.' });
  }
}

// Admin Update Blood Bank Stock (Protected)
router.put('/blood-stock', verifyAdminToken, (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { bloodStock } = req.body;

    if (!bloodStock) {
      return res.status(400).json({ success: false, message: 'Blood stock data is required.' });
    }

    const updated = store.update('hospitals', h => h._id === hospitalId, { bloodStock });

    // Real-time broadcast to all connected public & admin clients
    const io = req.app.get('io');
    if (io && updated) {
      const { password, ...hospPayload } = updated;
      io.emit(`blood_update_${hospitalId}`, bloodStock);
      io.emit(`hospital_update_${hospitalId}`, hospPayload);
      io.emit('global_blood_update');
      io.emit('global_hospitals_update');
    }

    res.json({ success: true, message: 'Blood availability updated successfully!', bloodStock: updated ? updated.bloodStock : bloodStock });
  } catch (err) {
    console.error('Error updating blood stock:', err);
    res.status(500).json({ success: false, message: 'Server error updating blood stock.' });
  }
});

// Admin Update Announcements (Protected)
router.put('/announcements', verifyAdminToken, (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { announcements } = req.body;

    const updated = store.update('hospitals', h => h._id === hospitalId, { announcements: announcements || [] });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit(`hospital_update_${hospitalId}`, updated);
    }

    res.json({ success: true, message: 'Announcements updated successfully!', announcements: updated.announcements });
  } catch (err) {
    console.error('Error updating announcements:', err);
    res.status(500).json({ success: false, message: 'Server error updating announcements.' });
  }
});

// Developer / Admin Delete Hospital Registration (Protected)
router.delete('/:id', verifyAdminToken, (req, res) => {
  try {
    const { id } = req.params;

    const hospital = store.findOne('hospitals', h => h._id === id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital registration not found.' });
    }

    // Delete hospital from store
    store.remove('hospitals', h => h._id === id);

    // Delete associated tokens and doctors for clean store
    store.remove('tokens', t => t.hospitalId === id);
    store.remove('doctors', d => d.hospitalId === id);

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('global_hospitals_update');
    }

    res.json({
      success: true,
      message: `Hospital "${hospital.name}" registration deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting hospital:', err);
    res.status(500).json({ success: false, message: 'Server error deleting hospital registration.' });
  }
});

module.exports = router;
