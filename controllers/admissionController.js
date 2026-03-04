const Admission = require('../models/Admission');
const excelWriter = require('../config/excelWriter');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/admissions');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename - remove special characters
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(sanitizedOriginalName));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit
  fileFilter: fileFilter
}).fields([
  { name: 'gradCertificate', maxCount: 1 },
  { name: 'marksheet10', maxCount: 1 },
  { name: 'marksheet12', maxCount: 1 },
  { name: 'leavingCertificate', maxCount: 1 },
  { name: 'migrationCertificate', maxCount: 1 },
  { name: 'gapAffidavit', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 },
  { name: 'marriageCertificate', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 }
]);

// Submit admission form
exports.submitAdmission = async (req, res) => {
  console.log('='.repeat(50));
  console.log('Received admission submission request');
  console.log('Time:', new Date().toISOString());
  console.log('Headers:', req.headers['content-type']);
  console.log('='.repeat(50));
  
  // Handle file uploads
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        success: false,
        error: 'File upload error', 
        details: err.message 
      });
    }

    try {
      // Log received data
      console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
      console.log('Body keys:', Object.keys(req.body));
      
      // Check if formData exists
      if (!req.body.formData) {
        console.error('No formData in request body');
        console.log('Available body fields:', Object.keys(req.body));
        return res.status(400).json({ 
          success: false,
          error: 'No form data provided',
          details: 'formData field is missing from request'
        });
      }

      // Parse form data
      let formData;
      try {
        formData = JSON.parse(req.body.formData);
        console.log('Form data parsed successfully');
        console.log('Form data keys:', Object.keys(formData));
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Raw formData:', req.body.formData.substring(0, 200) + '...'); // Log first 200 chars
        return res.status(400).json({ 
          success: false,
          error: 'Invalid form data format',
          details: parseError.message
        });
      }
      
      // Process uploaded files
      const documents = {};
      if (req.files) {
        console.log('Processing uploaded files:', Object.keys(req.files));
        Object.keys(req.files).forEach(key => {
          const file = req.files[key][0];
          documents[key] = {
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          };
          console.log(`File processed: ${key} - ${file.originalname} (${file.size} bytes)`);
        });
      }

      // Merge documents with form data
      formData.documents = { ...formData.documents, ...documents };

      // Get IP address
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      // Create new admission record
      const admission = new Admission({
        ...formData,
        ipAddress
      });

      // Validate required fields
      const validationError = admission.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.message
        });
      }

      // Save to database
      await admission.save();
      console.log('✅ Admission saved successfully with ID:', admission._id);
      console.log('Application Number:', admission.applicationNumber);

      // Write to Excel file (don't await to not block response)
      excelWriter.appendToExcel(admission.toObject()).catch(err => {
        console.error('Excel write error:', err);
      });

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        applicationNumber: admission.applicationNumber,
        data: {
          id: admission._id,
          applicationNumber: admission.applicationNumber,
          submittedAt: admission.submittedAt,
          name: `${admission.firstName} ${admission.surname}`
        }
      });

    } catch (error) {
      console.error('❌ Error processing submission:', error);
      
      // Check for duplicate key error
      if (error.code === 11000) {
        console.error('Duplicate key error:', error.keyPattern);
        return res.status(400).json({ 
          success: false,
          error: 'Duplicate application. Please try again.',
          details: 'An application with this information already exists'
        });
      }
      
      // Check for validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      
      res.status(500).json({ 
        success: false,
        error: 'Failed to submit application', 
        details: error.message 
      });
    }
  });
};

// Get all admissions (admin only)
exports.getAllAdmissions = async (req, res) => {
  try {
    console.log('Fetching all admissions...');
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const admissions = await Admission.find()
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'); // Exclude version field
    
    const total = await Admission.countDocuments();
    
    console.log(`Found ${admissions.length} admissions (page ${page})`);
    
    res.json({
      success: true,
      count: admissions.length,
      total: total,
      page: page,
      pages: Math.ceil(total / limit),
      data: admissions
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

// Get single admission by ID (admin only)
exports.getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching admission by ID:', id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Admission ID is required' 
      });
    }
    
    const admission = await Admission.findById(id).select('-__v');
    
    if (!admission) {
      console.log('Admission not found with ID:', id);
      return res.status(404).json({ 
        success: false,
        error: 'Admission not found' 
      });
    }
    
    console.log('Admission found:', admission.applicationNumber);
    
    res.json({
      success: true,
      data: admission
    });
  } catch (error) {
    console.error('Error fetching admission:', error);
    
    // Check for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid admission ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch admission', 
      details: error.message 
    });
  }
};

// Get admission by application number
exports.getAdmissionByAppNumber = async (req, res) => {
  try {
    const { appNumber } = req.params;
    console.log('Fetching admission by application number:', appNumber);
    
    if (!appNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Application number is required' 
      });
    }
    
    const admission = await Admission.findOne({ 
      applicationNumber: appNumber 
    }).select('-__v -documents'); // Exclude documents for public view
    
    if (!admission) {
      console.log('Admission not found with application number:', appNumber);
      return res.status(404).json({ 
        success: false,
        error: 'Admission not found' 
      });
    }
    
    console.log('Admission found for tracking');
    
    res.json({
      success: true,
      data: {
        applicationNumber: admission.applicationNumber,
        name: `${admission.firstName} ${admission.surname}`,
        course: admission.course,
        submittedAt: admission.submittedAt,
        status: 'Received' // You can add status field later
      }
    });
  } catch (error) {
    console.error('Error fetching admission:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch admission', 
      details: error.message 
    });
  }
};

// Download Excel file (admin only)
exports.downloadExcel = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../exports/admissions.xlsx');
    
    console.log('Attempting to download Excel file:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('Excel file not found, generating new one...');
      
      // Generate new Excel file from database
      const admissions = await Admission.find().sort({ submittedAt: -1 });
      
      if (admissions.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'No admissions data available' 
        });
      }
      
      // Write all admissions to Excel
      for (const admission of admissions) {
        await excelWriter.appendToExcel(admission.toObject());
      }
    }
    
    // Check again after generation
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false,
        error: 'Failed to generate Excel file' 
      });
    }
    
    res.download(filePath, `admissions_${new Date().toISOString().split('T')[0]}.xlsx`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false,
            error: 'Failed to download file' 
          });
        }
      }
    });
  } catch (error) {
    console.error('Error in downloadExcel:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to download Excel', 
      details: error.message 
    });
  }
};

// Get statistics (admin only)
exports.getStatistics = async (req, res) => {
  try {
    console.log('Fetching admission statistics...');
    
    const total = await Admission.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await Admission.countDocuments({
      submittedAt: { $gte: today }
    });
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthCount = await Admission.countDocuments({
      submittedAt: { $gte: thisMonth }
    });
    
    const thisYear = new Date(today.getFullYear(), 0, 1);
    const yearCount = await Admission.countDocuments({
      submittedAt: { $gte: thisYear }
    });
    
    // Get course-wise distribution
    const courseDistribution = await Admission.aggregate([
      { $group: { _id: "$course", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('Statistics calculated successfully');
    
    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        thisMonth: monthCount,
        thisYear: yearCount,
        courseDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics', 
      details: error.message 
    });
  }
};

// Delete admission (admin only)
exports.deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete admission:', id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false,
        error: 'Admission ID is required' 
      });
    }
    
    const admission = await Admission.findById(id);
    
    if (!admission) {
      console.log('Admission not found for deletion:', id);
      return res.status(404).json({ 
        success: false,
        error: 'Admission not found' 
      });
    }
    
    // Delete associated files
    if (admission.documents) {
      console.log('Deleting associated files...');
      let deletedCount = 0;
      
      Object.values(admission.documents).forEach(doc => {
        if (doc && doc.path && fs.existsSync(doc.path)) {
          try {
            fs.unlinkSync(doc.path);
            deletedCount++;
            console.log(`Deleted file: ${doc.path}`);
          } catch (fileError) {
            console.error(`Error deleting file ${doc.path}:`, fileError);
          }
        }
      });
      
      console.log(`Deleted ${deletedCount} associated files`);
    }
    
    await admission.deleteOne();
    console.log('✅ Admission deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'Admission deleted successfully',
      data: {
        id: admission._id,
        applicationNumber: admission.applicationNumber,
        name: `${admission.firstName} ${admission.surname}`
      }
    });
  } catch (error) {
    console.error('Error deleting admission:', error);
    
    // Check for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid admission ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete admission', 
      details: error.message 
    });
  }
};

// Search admissions (admin only)
exports.searchAdmissions = async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Searching admissions with query:', query);
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }
    
    const admissions = await Admission.find({
      $or: [
        { applicationNumber: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { surname: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { studentContact: { $regex: query, $options: 'i' } },
        { course: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ submittedAt: -1 })
    .limit(50)
    .select('-__v -documents');
    
    console.log(`Found ${admissions.length} matching admissions`);
    
    res.json({
      success: true,
      count: admissions.length,
      data: admissions
    });
  } catch (error) {
    console.error('Error searching admissions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to search admissions', 
      details: error.message 
    });
  }
};

// Bulk delete admissions (admin only)
exports.bulkDeleteAdmissions = async (req, res) => {
  try {
    const { ids } = req.body;
    console.log('Bulk deleting admissions:', ids);
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of admission IDs to delete'
      });
    }
    
    let deletedCount = 0;
    let failedIds = [];
    
    for (const id of ids) {
      try {
        const admission = await Admission.findById(id);
        
        if (admission) {
          // Delete associated files
          if (admission.documents) {
            Object.values(admission.documents).forEach(doc => {
              if (doc && doc.path && fs.existsSync(doc.path)) {
                try {
                  fs.unlinkSync(doc.path);
                } catch (fileError) {
                  console.error(`Error deleting file for admission ${id}:`, fileError);
                }
              }
            });
          }
          
          await admission.deleteOne();
          deletedCount++;
        } else {
          failedIds.push(id);
        }
      } catch (itemError) {
        console.error(`Error deleting admission ${id}:`, itemError);
        failedIds.push(id);
      }
    }
    
    console.log(`Bulk delete completed: ${deletedCount} deleted, ${failedIds.length} failed`);
    
    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} admissions`,
      data: {
        deleted: deletedCount,
        failed: failedIds
      }
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform bulk delete', 
      details: error.message 
    });
  }
};

module.exports = exports;