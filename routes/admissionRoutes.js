const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const auth = require('../middleware/auth');

// Public routes
router.post('/submit', admissionController.submitAdmission);
router.get('/track/:appNumber', admissionController.getAdmissionByAppNumber);

// Admin routes (protected)
router.get('/admin/all', auth, admissionController.getAllAdmissions);
router.get('/admin/:id', auth, admissionController.getAdmissionById);
router.delete('/admin/:id', auth, admissionController.deleteAdmission);
router.get('/admin/excel/download', auth, admissionController.downloadExcel);
router.get('/admin/statistics', auth, admissionController.getStatistics);

module.exports = router;