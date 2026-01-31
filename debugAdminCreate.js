const express = require('express');
const bodyParser = require('body-parser');

// Create a minimal Express app to test
const app = express();
app.use(bodyParser.json());

// Minimal route to test
app.post('/debug-create', async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  
  // Simulate the create admin logic without database
  const { username, email, password, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields' 
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Debug: Admin would be created',
    data: { username, email, role: role || 'admin' }
  });
});

app.listen(5001, () => {
  console.log('Debug server running on port 5001');
  console.log('Test with: POST http://localhost:5001/debug-create');
  console.log('Body: { "username": "admin", "email": "admin@example.com", "password": "admin123" }');
});