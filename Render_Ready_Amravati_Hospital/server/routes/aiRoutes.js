const express = require('express');
const router = express.Router();
const store = require('../data/store');

const DISCLAIMER = "AI provides general guidance only and is not a substitute for professional medical advice.";

// Smart Medical & Amravati Hospital Fallback Knowledge Base
const getSmartAIResponse = (query, contextHospitalId) => {
  const q = query.toLowerCase();

  let contextHospital = null;
  if (contextHospitalId) {
    contextHospital = store.findOne('hospitals', h => h._id === contextHospitalId);
  }

  // 1. Emergency or Critical queries
  if (q.includes('emergency') || q.includes('ambulance') || q.includes('accident') || q.includes('chest pain') || q.includes('bleeding')) {
    return {
      text: `🚨 **EMERGENCY ASSISTANCE**: If you or someone around you is facing a medical emergency in Amravati, please call **108 (Government Ambulance)** or contact **Irwin Emergency Desk (+91 721 2662309)** immediately! ${contextHospital ? `Direct Emergency Hotline for ${contextHospital.name}: ${contextHospital.emergencyPhone}` : ''}`,
      disclaimer: DISCLAIMER,
      isEmergency: true
    };
  }

  // 2. Token & Queue queries
  if (q.includes('token') || q.includes('queue') || q.includes('wait') || q.includes('number')) {
    const tokens = store.find('tokens');
    const waitingCount = tokens.filter(t => t.status === 'Waiting').length;
    return {
      text: `🎟️ **Token Queue Guidance**: You can view live token status on any hospital's detail page. Currently across registered Amravati hospitals, there are approx ${waitingCount} patients in waiting queues. Estimated wait time is approx 10 minutes per patient before your token number is called. You can also search your exact Token by Patient ID (e.g., AMR-1003) on the website dashboard!`,
      disclaimer: DISCLAIMER
    };
  }

  // 3. Hospital Timings & Locations
  if (q.includes('timing') || q.includes('time') || q.includes('open') || q.includes('location') || q.includes('address')) {
    if (contextHospital) {
      return {
        text: `🏥 **${contextHospital.name}**: \n📍 Address: ${contextHospital.address}\n⏰ OPD Timings: ${contextHospital.openingTime} - ${contextHospital.closingTime} (24x7 Emergency Services active)\n📞 Phone: ${contextHospital.phone}`,
        disclaimer: DISCLAIMER
      };
    }
    return {
      text: `🏥 **Amravati Hospital Timings**: Most major hospitals like **Irwin District General Hospital** and **PDMC Medical College Hospital** operate 24x7 Emergency Casualty services, while routine OPD consultations are active from **08:00 AM to 08:00 PM**.`,
      disclaimer: DISCLAIMER
    };
  }

  // 4. Blood Availability queries
  if (q.includes('blood') || q.includes('plasma') || q.includes('donor')) {
    return {
      text: `🩸 **Blood Availability in Amravati**: Live blood stocks for A+, B+, O+, AB+, O- and other groups are updated continuously by hospital admins on the **Blood Availability** tab. Major blood banks are located at Irwin District Hospital and PDMC Amravati.`,
      disclaimer: DISCLAIMER
    };
  }

  // 5. First Aid & Health Guidance
  if (q.includes('fever') || q.includes('cold') || q.includes('headache') || q.includes('first aid') || q.includes('burn')) {
    return {
      text: `🩺 **General Health Tip**: For mild fever or headache, rest well, stay hydrated with fresh water and fluids, and monitor temperature. If fever persists above 101°F or lasts more than 48 hours, visit an OPD physician at Irwin or PDMC Hospital immediately.`,
      disclaimer: DISCLAIMER
    };
  }

  // Default response
  return {
    text: `Hello! I am your Amravati Healthcare AI Assistant. I can help answer questions regarding OPD token wait times, hospital locations, emergency ambulance numbers (108), doctor specializations, blood availability, and basic first-aid advice. How may I assist you today?`,
    disclaimer: DISCLAIMER
  };
};

router.post('/chat', async (req, res) => {
  try {
    const { prompt, hospitalId } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Query prompt is required.' });
    }

    // Try Google Gemini API if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let systemContext = `You are the Amravati Hospital Management System AI Assistant. Respond concisely, helpfully, and with medical accuracy. Disclaimer: ${DISCLAIMER}.`;

        if (hospitalId) {
          const hosp = store.findOne('hospitals', h => h._id === hospitalId);
          if (hosp) {
            systemContext += ` Current Hospital Context: ${hosp.name}, Address: ${hosp.address}, Timings: ${hosp.openingTime}-${hosp.closingTime}, Phone: ${hosp.phone}.`;
          }
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemContext}\nUser Question: ${prompt}`
        });

        if (response && response.text) {
          return res.json({
            success: true,
            reply: response.text,
            disclaimer: DISCLAIMER
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call skipped/fallback triggered:', geminiErr.message);
      }
    }

    // Smart fallback
    const result = getSmartAIResponse(prompt, hospitalId);
    res.json({
      success: true,
      reply: result.text,
      disclaimer: result.disclaimer,
      isEmergency: result.isEmergency || false
    });

  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ success: false, message: 'Server error processing AI response.' });
  }
});

module.exports = router;
