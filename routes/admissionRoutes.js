const express = require('express');
const router = express.Router();
const {
  submitAdmission,
  getAllAdmissions,
  getAdmissionById,
  downloadExcel,
  getExcelData
} = require('../controllers/admissionController');
const auth = require('../middleware/auth');

// Public routes
router.post('/submit', submitAdmission);

// Protected admin routes
router.get('/all', auth, getAllAdmissions);
router.get('/excel-data', auth, getExcelData);
router.get('/download-excel', auth, downloadExcel);
router.get('/:id', auth, getAdmissionById);

module.exports = router;