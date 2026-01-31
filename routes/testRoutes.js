const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Test route working',
    timestamp: new Date().toISOString()
  });
});

// Test POST route
router.post('/test-post', (req, res) => {
  res.json({ 
    message: 'POST test route working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;