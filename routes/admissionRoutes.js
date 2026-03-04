const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const auth = require('../middleware/auth');

// Debug middleware for this router
router.use((req, res, next) => {
  console.log(`Admission Route: ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
router.post('/submit', admissionController.submitAdmission);
router.get('/track/:appNumber', admissionController.getAdmissionByAppNumber);

// Admin routes (protected)
router.get('/admin/all', auth, admissionController.getAllAdmissions);
router.get('/admin/:id', auth, admissionController.getAdmissionById);
router.delete('/admin/:id', auth, admissionController.deleteAdmission);
router.get('/admin/excel/download', auth, admissionController.downloadExcel);
router.get('/admin/statistics', auth, admissionController.getStatistics);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Admission routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;