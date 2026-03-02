const Admission = require('../models/Admission');
const excelGenerator = require('../utils/excelGenerator');
const googleDrive = require('../config/googleDrive');
const fs = require('fs');

// @desc    Submit admission form
// @route   POST /api/admission/submit
// @access  Public
exports.submitAdmission = async (req, res) => {
  try {
    const formData = req.body;
    
    // Add IP address and user agent if available
    if (req.ip) formData.ipAddress = req.ip;
    if (req.headers['user-agent']) formData.userAgent = req.headers['user-agent'];
    
    // Save to MongoDB
    const admission = new Admission(formData);
    await admission.save();
    
    // Update Excel file
    try {
      // Check if Excel file exists
      const excelPath = excelGenerator.getExcelPath();
      
      if (fs.existsSync(excelPath)) {
        // Append to existing file
        await excelGenerator.appendToExcel(admission);
      } else {
        // Get all admissions and create new file
        const allAdmissions = await Admission.find().sort({ submittedAt: -1 });
        await excelGenerator.createExcelFile(allAdmissions);
      }
      
      // Upload to Google Drive
      try {
        const fileName = 'admissions.xlsx';
        const driveFile = await googleDrive.findOrCreateFile(fileName);
        
        if (driveFile) {
          // Update existing file
          await googleDrive.updateFile(driveFile.id, excelGenerator.getExcelPath());
        } else {
          // Upload new file
          await googleDrive.uploadFile(excelGenerator.getExcelPath(), fileName);
        }
      } catch (driveError) {
        console.error('Google Drive upload error:', driveError);
        // Don't fail the request if Drive upload fails
      }
      
    } catch (excelError) {
      console.error('Excel generation error:', excelError);
      // Don't fail the request if Excel generation fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        id: admission._id,
        formType: admission.formType
      }
    });
    
  } catch (error) {
    console.error('Admission submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit form',
      details: error.message
    });
  }
};

// @desc    Get all admissions (admin only)
// @route   GET /api/admission/all
// @access  Private (Admin)
exports.getAllAdmissions = async (req, res) => {
  try {
    const { formType, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    // Build filter
    const filter = {};
    if (formType) filter.formType = formType;
    if (startDate || endDate) {
      filter.submittedAt = {};
      if (startDate) filter.submittedAt.$gte = new Date(startDate);
      if (endDate) filter.submittedAt.$lte = new Date(endDate);
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const admissions = await Admission.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Admission.countDocuments(filter);
    
    res.json({
      success: true,
      data: admissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admissions'
    });
  }
};

// @desc    Download Excel file
// @route   GET /api/admission/download-excel
// @access  Private (Admin)
exports.downloadExcel = async (req, res) => {
  try {
    const excelPath = excelGenerator.getExcelPath();
    
    // Check if file exists
    if (!fs.existsSync(excelPath)) {
      // Create new file with all admissions
      const admissions = await Admission.find().sort({ submittedAt: -1 });
      await excelGenerator.createExcelFile(admissions);
    }
    
    res.download(excelPath, `admissions_${new Date().toISOString().split('T')[0]}.xlsx`);
    
  } catch (error) {
    console.error('Error downloading Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download Excel file'
    });
  }
};

// @desc    Get admission statistics
// @route   GET /api/admission/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalAdmissions = await Admission.countDocuments();
    const totalEnquiries = await Admission.countDocuments({ formType: 'enquiry' });
    const totalApplications = await Admission.countDocuments({ formType: 'admission' });
    
    // Today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = await Admission.countDocuments({
      submittedAt: { $gte: today }
    });
    
    // Course-wise distribution
    const courseDistribution = await Admission.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalAdmissions,
        enquiries: totalEnquiries,
        applications: totalApplications,
        today: todaySubmissions,
        courseDistribution
      }
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};