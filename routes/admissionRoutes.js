const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const excelService = require('../services/excelService');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// @route   POST /api/admissions
// @desc    Submit admission form
// @access  Public
router.post('/', async (req, res) => {
  try {
    console.log('Received admission data');
    
    // Create new admission
    const admission = new Admission(req.body);
    await admission.save();
    console.log('Admission saved to database with ID:', admission._id);

    // Write to Excel with retry logic
    let excelSuccess = false;
    try {
      excelSuccess = await excelService.appendToExcel(admission.toObject());
      if (excelSuccess) {
        console.log('✅ Data written to Excel successfully');
      }
    } catch (excelError) {
      console.error('❌ Excel write error:', excelError.message);
      // Don't fail the request if Excel write fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationNumber: admission.applicationNumber,
      excelWritten: excelSuccess,
      data: {
        id: admission._id,
        applicationNumber: admission.applicationNumber,
        name: `${admission.firstName} ${admission.surname}`,
        submittedAt: admission.submittedAt
      }
    });
  } catch (error) {
    console.error('❌ Error saving admission:', error);
    
    // Check for duplicate key error (application number)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate application number. Please try again.',
        details: error.message
      });
    }
    
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
router.get('/export/excel', auth, async (req, res) => {
  try {
    const excelPath = excelService.getExcelPath();
    
    // Check if file exists
    if (!fs.existsSync(excelPath)) {
      return res.status(404).json({
        success: false,
        error: 'Excel file not found'
      });
    }

    // Get file stats
    const stats = fs.statSync(excelPath);
    console.log('Excel file size:', stats.size, 'bytes');

    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=admissions.xlsx');
    res.setHeader('Content-Length', stats.size);

    // Send file
    res.download(excelPath, 'admissions.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        // Only send error if headers haven't been sent
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Failed to download file'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export Excel',
      details: error.message
    });
  }
});

// @route   GET /api/admissions/excel/status
// @desc    Check Excel file status
// @access  Private
router.get('/excel/status', auth, (req, res) => {
  try {
    const excelPath = excelService.getExcelPath();
    const exists = fs.existsSync(excelPath);
    
    let stats = null;
    if (exists) {
      stats = fs.statSync(excelPath);
    }
    
    res.json({
      success: true,
      exists,
      path: excelPath,
      stats: stats ? {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      } : null
    });
  } catch (error) {
    console.error('Error checking Excel status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Excel status'
    });
  }
});

module.exports = router;