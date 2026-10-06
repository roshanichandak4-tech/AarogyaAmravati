const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { verifyAdminToken } = require('../middleware/auth');
const https = require('https');
const querystring = require('querystring');

// Helper to send real SMS via Twilio API
const sendTwilioSMS = (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('ℹ️ Twilio SMS credentials not set. Simulated SMS log:', body);
    return;
  }

  // Format recipient number (ensure prefix +91 or match user)
  let formattedTo = to.trim();
  if (!formattedTo.startsWith('+')) {
    formattedTo = '+91' + formattedTo; // Default to Indian country code
  }

  const postData = querystring.stringify({
    To: formattedTo,
    From: fromNumber,
    Body: body
  });

  const authHeader = 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64');

  const options = {
    hostname: 'api.twilio.com',
    port: 443,
    path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
      console.log(`✅ Twilio API responded with status ${res.statusCode}:`, responseBody);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Twilio SMS send failed:', e.message);
  });

  req.write(postData);
  req.end();
};

// Helper to broadcast real-time queue changes via Socket.io
const emitQueueUpdate = (app, hospitalId) => {
  const io = app.get('io');
  if (!io) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const hospitalTokens = store.find('tokens', t => t.hospitalId === hospitalId && t.date === todayStr);

  const waitingTokens = hospitalTokens.filter(t => t.status === 'Waiting');
  const calledTokens = hospitalTokens.filter(t => t.status === 'Called');
  const completedTokens = hospitalTokens.filter(t => t.status === 'Completed');

  const currentToken = calledTokens.length > 0
    ? calledTokens[calledTokens.length - 1].tokenNumber
    : (completedTokens.length > 0 ? completedTokens[completedTokens.length - 1].tokenNumber : 0);

  const nextToken = waitingTokens.length > 0 ? waitingTokens[0].tokenNumber : 'None';
  const waitingCount = waitingTokens.length;

  const publicQueueState = {
    currentToken,
    nextToken,
    waitingCount,
    estimatedWaitTimeMinutes: waitingCount * 10,
    publicTokens: hospitalTokens.map(t => ({
      tokenNumber: t.tokenNumber,
      department: t.department,
      status: t.status,
      date: t.date,
      opdTime: t.opdTime || '09:00 AM',
      time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  };

  io.emit(`queue_update_${hospitalId}`, publicQueueState);
  io.emit('global_queue_change');
};

// Public Get Queue Status for a Hospital (Strictly anonymized)
router.get('/hospital/:hospitalId', (req, res) => {
  try {
    const { hospitalId } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    const tokens = store.find('tokens', t => t.hospitalId === hospitalId && t.date === todayStr);

    const waitingTokens = tokens.filter(t => t.status === 'Waiting');
    const calledTokens = tokens.filter(t => t.status === 'Called');
    const completedTokens = tokens.filter(t => t.status === 'Completed');

    const currentToken = calledTokens.length > 0
      ? calledTokens[calledTokens.length - 1].tokenNumber
      : (completedTokens.length > 0 ? completedTokens[completedTokens.length - 1].tokenNumber : 0);

    const nextToken = waitingTokens.length > 0 ? waitingTokens[0].tokenNumber : 'None';
    const waitingCount = waitingTokens.length;

    // Public output hides patientName and phoneNumber
    const publicTokens = tokens.map(t => ({
      _id: t._id,
      tokenNumber: t.tokenNumber,
      department: t.department,
      status: t.status,
      date: t.date,
      time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json({
      success: true,
      currentToken,
      nextToken,
      waitingCount,
      estimatedWaitTimeMinutes: waitingCount * 10,
      tokens: publicTokens
    });
  } catch (err) {
    console.error('Error fetching public tokens:', err);
    res.status(500).json({ success: false, message: 'Server error fetching queue status.' });
  }
});

// Patient Search Token by Patient ID (Public allowed to view their own ID status)
router.get('/search/:patientId', (req, res) => {
  try {
    const { patientId } = req.params;
    const tokenRecord = store.findOne('tokens', t => t.patientId.toUpperCase() === patientId.toUpperCase());

    if (!tokenRecord) {
      return res.status(404).json({ success: false, message: `No token found for Patient ID: ${patientId}` });
    }

    const hospital = store.findOne('hospitals', h => h._id === tokenRecord.hospitalId);
    const todayStr = new Date().toISOString().split('T')[0];
    const hospitalTokens = store.find('tokens', t => t.hospitalId === tokenRecord.hospitalId && t.date === todayStr);

    const waitingBeforeMe = hospitalTokens.filter(t =>
      t.department === tokenRecord.department &&
      t.status === 'Waiting' &&
      t.tokenNumber < tokenRecord.tokenNumber
    ).length;

    res.json({
      success: true,
      token: {
        patientId: tokenRecord.patientId,
        tokenNumber: tokenRecord.tokenNumber,
        department: tokenRecord.department,
        status: tokenRecord.status,
        date: tokenRecord.date,
        time: new Date(tokenRecord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hospitalName: hospital ? hospital.name : 'Amravati Hospital',
        waitingBeforeMe,
        estimatedWaitMinutes: waitingBeforeMe * 10
      }
    });
  } catch (err) {
    console.error('Error searching patient token:', err);
    res.status(500).json({ success: false, message: 'Server error searching token.' });
  }
});

// Admin Get Full Patient Token Records (Includes names & phone numbers)
router.get('/admin/all', verifyAdminToken, (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { date, department, status } = req.query;

    let tokens = store.find('tokens', t => t.hospitalId === hospitalId);

    if (date) {
      tokens = tokens.filter(t => t.date === date);
    }
    if (department) {
      tokens = tokens.filter(t => t.department === department);
    }
    if (status) {
      tokens = tokens.filter(t => t.status === status);
    }

    tokens.sort((a, b) => a.tokenNumber - b.tokenNumber);

    res.json({ success: true, count: tokens.length, tokens });
  } catch (err) {
    console.error('Error fetching admin patient records:', err);
    res.status(500).json({ success: false, message: 'Server error fetching patient records.' });
  }
});

// Admin Register Patient & Generate Token (Protected)
router.post('/register', verifyAdminToken, (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { patientName, phoneNumber, department, opdTime, date } = req.body;

    if (!patientName || !phoneNumber || !department) {
      return res.status(400).json({ success: false, message: 'Patient Name, Phone Number, and Department are required.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const targetDate = date || todayStr;
    
    const deptTokensOnDate = store.find('tokens', t =>
      t.hospitalId === hospitalId &&
      t.date === targetDate &&
      t.department === department
    );

    const nextTokenNum = deptTokensOnDate.length + 1;
    const patientId = `AMR-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Auto-calculate approximate OPD time if none provided
    const targetOpdTime = opdTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newToken = store.insert('tokens', {
      hospitalId,
      patientName,
      patientId,
      phoneNumber,
      department,
      tokenNumber: nextTokenNum,
      date: targetDate,
      opdTime: targetOpdTime,
      status: 'Waiting',
      estimatedWaitTimeMinutes: (deptTokensOnDate.filter(t => t.status === 'Waiting').length) * 10
    });

    const hospital = store.findOne('hospitals', h => h._id === hospitalId);
    
    const smsMessage = `Hello ${patientName}, your token #${newToken.tokenNumber} for ${department} at ${hospital ? hospital.name : 'Hospital'} is confirmed for Date: ${targetDate} at Time slot: ${targetOpdTime}. Patient ID: ${patientId}. Track live: http://localhost:5000/hospital/${hospital ? hospital.slug : hospitalId}`;

    // 1. Write patient details date-wise to local text log file
    const fs = require('fs');
    const path = require('path');
    const recordsDir = path.join(__dirname, '../data/patient_records');
    if (!fs.existsSync(recordsDir)) {
      fs.mkdirSync(recordsDir, { recursive: true });
    }
    const logFile = path.join(recordsDir, `records_${targetDate}.txt`);
    const logLine = `[${new Date().toLocaleTimeString()}] ID: ${patientId} | Token: #${newToken.tokenNumber} | Name: ${patientName} | Phone: ${phoneNumber} | Dept: ${department} | Slot: ${targetOpdTime} | Status: Waiting\n`;
    fs.appendFileSync(logFile, logLine, 'utf8');

    // 2. Generate WhatsApp Web click-to-chat API URL
    let waPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (waPhone.length === 10) {
      waPhone = '91' + waPhone; // Indian country code prefix
    }
    const whatsappLink = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(smsMessage)}`;

    // Send actual SMS via Twilio if configured
    sendTwilioSMS(phoneNumber, smsMessage);

    // Emit real-time queue update
    emitQueueUpdate(req.app, hospitalId);

    res.status(201).json({
      success: true,
      message: `Token #${newToken.tokenNumber} generated successfully!`,
      token: newToken,
      whatsappLink,
      notification: {
        simulatedSMS: `[SMS Alert sent to ${phoneNumber}] ${smsMessage}`
      }
    });
  } catch (err) {
    console.error('Error registering token:', err);
    res.status(500).json({ success: false, message: 'Server error registering token.' });
  }
});

// Admin Call Next Token (Protected)
router.put('/call-next', verifyAdminToken, (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const { department } = req.body;

    const todayStr = new Date().toISOString().split('T')[0];

    // Find next waiting token
    const waitingList = store.find('tokens', t =>
      t.hospitalId === hospitalId &&
      t.date === todayStr &&
      t.status === 'Waiting' &&
      (!department || t.department === department)
    );

    if (waitingList.length === 0) {
      return res.status(400).json({ success: false, message: 'No waiting patients in queue.' });
    }

    waitingList.sort((a, b) => a.tokenNumber - b.tokenNumber);
    const targetToken = waitingList[0];

    const updated = store.update('tokens', t => t._id === targetToken._id, { status: 'Called' });
    const hospital = store.findOne('hospitals', h => h._id === hospitalId);

    const callSMS = `Token #${updated.tokenNumber} (${updated.patientName}): Please proceed to ${updated.department} desk at ${hospital ? hospital.name : 'Hospital'} immediately!`;
    
    // Generate WhatsApp click-to-chat URL for Call Next notification
    let waPhone = updated.phoneNumber.replace(/[^0-9]/g, '');
    if (waPhone.length === 10) {
      waPhone = '91' + waPhone;
    }
    const whatsappLink = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(callSMS)}`;

    // Send actual Twilio SMS
    sendTwilioSMS(updated.phoneNumber, callSMS);

    emitQueueUpdate(req.app, hospitalId);

    res.json({
      success: true,
      message: `Token #${updated.tokenNumber} called to desk!`,
      calledToken: updated,
      whatsappLink,
      notification: {
        simulatedSMS: `[SMS Alert sent to ${updated.phoneNumber}] ${callSMS}`
      }
    });
  } catch (err) {
    console.error('Error calling next token:', err);
    res.status(500).json({ success: false, message: 'Server error calling next token.' });
  }
});

// Admin Update Token Status (Skip or Complete) (Protected)
router.put('/status/:id', verifyAdminToken, (req, res) => {
  try {
    const { id } = req.params;
    const hospitalId = req.admin.hospitalId;
    const { status } = req.body; // 'Completed', 'Skipped', 'Called', 'Waiting'

    if (!['Completed', 'Skipped', 'Called', 'Waiting'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const token = store.findOne('tokens', t => t._id === id);
    if (!token || token.hospitalId !== hospitalId) {
      return res.status(403).json({ success: false, message: 'Token record not found or unauthorized.' });
    }

    const updated = store.update('tokens', t => t._id === id, { status });
    const hospital = store.findOne('hospitals', h => h._id === hospitalId);

    const statusSMS = `Your Token #${updated.tokenNumber} status at ${hospital ? hospital.name : 'Hospital'} has been updated to: ${status}.`;
    
    // Send actual Twilio SMS
    sendTwilioSMS(updated.phoneNumber, statusSMS);

    emitQueueUpdate(req.app, hospitalId);

    res.json({
      success: true,
      message: `Token #${updated.tokenNumber} marked as ${status}.`,
      token: updated,
      notification: {
        simulatedSMS: `[SMS Alert sent to ${updated.phoneNumber}] ${statusSMS}`
      }
    });
  } catch (err) {
    console.error('Error updating token status:', err);
    res.status(500).json({ success: false, message: 'Server error updating token status.' });
  }
});

// Admin Reset Daily Queue (Protected)
router.post('/reset-daily', verifyAdminToken, (req, res) => {
  try {
    const hospitalId = req.admin.hospitalId;
    const todayStr = new Date().toISOString().split('T')[0];

    // Remove or reset today's tokens for this hospital
    store.remove('tokens', t => t.hospitalId === hospitalId && t.date === todayStr);

    emitQueueUpdate(req.app, hospitalId);

    res.json({ success: true, message: "Today's patient token queue has been reset successfully." });
  } catch (err) {
    console.error('Error resetting queue:', err);
    res.status(500).json({ success: false, message: 'Server error resetting queue.' });
  }
});

module.exports = router;
