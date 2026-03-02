const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admissionController = require('../controllers/admissionController');

// Public routes
router.post('/submit', admissionController.submitAdmission);

// Protected routes (admin only)
router.get('/all', auth, admissionController.getAllAdmissions);
router.get('/download-excel', auth, admissionController.downloadExcel);
router.get('/stats', auth, admissionController.getStats);

module.exports = router;