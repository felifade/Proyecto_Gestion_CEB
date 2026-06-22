const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const captureService = require('./services/captureService');

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'active', platform: process.platform });
});

// Capture endpoint
app.post('/api/capture', async (req, res) => {
  const { grades, delayMs } = req.body;
  if (!grades || !Array.isArray(grades)) {
    return res.status(400).json({ error: 'grades array is required' });
  }
  
  const delay = delayMs ? parseInt(delayMs, 10) : 150;
  
  try {
    const result = await captureService.capture(grades, delay);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error during capture simulation:', error);
    res.status(500).json({ error: 'Failed to inject keystrokes', details: error.message });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
