const Admission = require('../models/Admission');
const excelWriter = require('../utils/excelWriter');
const path = require('path');

// @desc    Submit admission/enquiry form
// @route   POST /api/admission/submit
// @access  Public
const submitForm = async (req, res) => {
  try {
    const formData = req.body;
    
    // Get IP and user agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    // Save to database
    const admission = new Admission({
      ...formData,
      ipAddress,
      userAgent
    });

    const savedAdmission = await admission.save();

    // Save to Excel file
    await excelWriter.addEntry(formData, ipAddress, userAgent);

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        id: savedAdmission._id,
        formType: savedAdmission.formType,
        submittedAt: savedAdmission.submittedAt
      }
    });
  } catch (error) {
    console.error('Form submission error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        details: 'A submission with this information already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to submit form',
      details: error.message
    });
  }
};

// @desc    Get all admissions (Admin only)
// @route   GET /api/admission/all
// @access  Private/Admin
const getAllAdmissions = async (req, res) => {
  try {
    const { page = 1, limit = 50, formType, startDate, endDate } = req.query;
    
    // Build filter
    const filter = {};
    if (formType) filter.formType = formType;
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(endDate);
    }

    // Get total count
    const total = await Admission.countDocuments(filter);

    // Get paginated results
    const admissions = await Admission.find(filter)
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      data: admissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admissions',
      details: error.message
    });
  }
};

// @desc    Download Excel file
// @route   GET /api/admission/download-excel
// @access  Private/Admin
const downloadExcel = async (req, res) => {
  try {
    const filePath = excelWriter.getFilePath();
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Excel file not found'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=admissions_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download Excel file',
      details: error.message
    });
  }
};

// @desc    Get statistics
// @route   GET /api/admission/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalAdmissions = await Admission.countDocuments({ formType: 'admission' });
    const totalEnquiries = await Admission.countDocuments({ formType: 'enquiry' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySubmissions = await Admission.countDocuments({
      submittedAt: { $gte: today }
    });

    // Get course-wise distribution
    const courseDistribution = await Admission.aggregate([
      { $match: { formType: 'admission' } },
      { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalAdmissions + totalEnquiries,
        admissions: totalAdmissions,
        enquiries: totalEnquiries,
        today: todaySubmissions,
        courseDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
};

module.exports = {
  submitForm,
  getAllAdmissions,
  downloadExcel,
  getStats
};