const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const excelService = require('../services/excelService');
const auth = require('../middleware/auth');
const path = require('path');

// @route   POST /api/admissions
// @desc    Submit admission form
// @access  Public
router.post('/', async (req, res) => {
  try {
    console.log('Received admission data:', req.body);
    
    // Create new admission
    const admission = new Admission(req.body);
    await admission.save();

    // Write to Excel
    try {
      await excelService.appendToExcel(admission.toObject());
      console.log('Data written to Excel successfully');
    } catch (excelError) {
      console.error('Excel write error:', excelError);
      // Don't fail the request if Excel write fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationNumber: admission.applicationNumber,
      data: admission
    });
  } catch (error) {
    console.error('Error saving admission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// @route   GET /api/admissions
// @desc    Get all admissions (admin only)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ submittedAt: -1 });
    res.json({
      success: true,
      count: admissions.length,
      data: admissions
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admissions'
    });
  }
});

// @route   GET /api/admissions/:id
// @desc    Get single admission by ID (admin only)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Admission not found'
      });
    }
    res.json({
      success: true,
      data: admission
    });
  } catch (error) {
    console.error('Error fetching admission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admission'
    });
  }
});

// @route   GET /api/admissions/export/excel
// @desc    Download Excel file (admin only)
// @access  Private
router.get('/export/excel', auth, (req, res) => {
  try {
    const excelPath = excelService.getExcelPath();
    res.download(excelPath, 'admissions.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          error: 'Failed to download file'
        });
      }
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export Excel'
    });
  }
});

module.exports = router;