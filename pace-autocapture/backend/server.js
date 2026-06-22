const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'active', platform: process.platform });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
