const Admission = require('../models/Admission');
const excelGenerator = require('../utils/excelGenerator');
const path = require('path');
const fs = require('fs');

// @desc    Submit new admission form
// @route   POST /api/admission/submit
// @access  Public
exports.submitAdmission = async (req, res) => {
  try {
    // Add IP address and user agent
    const admissionData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Parse academic records if they're sent as strings
    if (admissionData.academicRecords && typeof admissionData.academicRecords === 'string') {
      admissionData.academicRecords = JSON.parse(admissionData.academicRecords);
    }

    // Parse fees payment if sent as string
    if (admissionData.feesPayment && typeof admissionData.feesPayment === 'string') {
      admissionData.feesPayment = JSON.parse(admissionData.feesPayment);
    }

    // Parse documents submitted if sent as string
    if (admissionData.documentsSubmitted && typeof admissionData.documentsSubmitted === 'string') {
      admissionData.documentsSubmitted = JSON.parse(admissionData.documentsSubmitted);
    }

    // Parse attendance undertaking if sent as string
    if (admissionData.attendanceUndertaking && typeof admissionData.attendanceUndertaking === 'string') {
      admissionData.attendanceUndertaking = JSON.parse(admissionData.attendanceUndertaking);
    }

    // Parse fees undertaking if sent as string
    if (admissionData.feesUndertaking && typeof admissionData.feesUndertaking === 'string') {
      admissionData.feesUndertaking = JSON.parse(admissionData.feesUndertaking);
    }

    // Save to database
    const admission = new Admission(admissionData);
    await admission.save();

    // Write to Excel file
    await excelGenerator.addRow(admission.toObject());

    res.status(201).json({
      success: true,
      message: 'Admission form submitted successfully',
      data: admission
    });
  } catch (error) {
    console.error('Admission submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit admission form',
      details: error.message
    });
  }
};

// @desc    Get all admissions (Admin only)
// @route   GET /api/admission/all
// @access  Private/Admin
exports.getAllAdmissions = async (req, res) => {
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
};

// @desc    Get single admission by ID (Admin only)
// @route   GET /api/admission/:id
// @access  Private/Admin
exports.getAdmissionById = async (req, res) => {
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
};

// @desc    Download Excel file
// @route   GET /api/admission/download-excel
// @access  Private/Admin
exports.downloadExcel = async (req, res) => {
  try {
    const filePath = excelGenerator.getExcelFilePath();
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Excel file not found'
      });
    }

    res.download(filePath, 'admissions.xlsx');
  } catch (error) {
    console.error('Error downloading Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download Excel file'
    });
  }
};

// @desc    Get Excel data as JSON
// @route   GET /api/admission/excel-data
// @access  Private/Admin
exports.getExcelData = async (req, res) => {
  try {
    const data = await excelGenerator.getAllData();
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error fetching Excel data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Excel data'
    });
  }
};