const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');

/* ---------- PUBLIC ---------- */

router.post('/submit', admissionController.submitAdmission);
router.get('/track/:appNumber', admissionController.getAdmissionByAppNumber);

/* ---------- ADMIN ---------- */

router.get('/admin/all', admissionController.getAllAdmissions);
router.get('/admin/:id', admissionController.getAdmissionById);
router.delete('/admin/:id', admissionController.deleteAdmission);
router.get('/admin/excel/download', admissionController.downloadExcel);
router.get('/admin/statistics', admissionController.getStatistics);

/* ---------- TEST ---------- */

router.get('/test',(req,res)=>{
  res.json({message:"Admission routes working"});
});

module.exports = router;