const Career = require('../models/Career');

// Create career
exports.createCareer = async (req, res) => {
  try {
    console.log('Received career data:', req.body);
    
    const careerData = { ...req.body };
    
    // Ensure requirements and responsibilities are arrays
    if (careerData.requirements) {
      if (typeof careerData.requirements === 'string') {
        careerData.requirements = [careerData.requirements];
      } else if (!Array.isArray(careerData.requirements)) {
        careerData.requirements = [];
      }
      // Filter out empty strings
      careerData.requirements = careerData.requirements.filter(req => req && req.trim() !== '');
    } else {
      careerData.requirements = [];
    }
    
    if (careerData.responsibilities) {
      if (typeof careerData.responsibilities === 'string') {
        careerData.responsibilities = [careerData.responsibilities];
      } else if (!Array.isArray(careerData.responsibilities)) {
        careerData.responsibilities = [];
      }
      // Filter out empty strings
      careerData.responsibilities = careerData.responsibilities.filter(res => res && res.trim() !== '');
    } else {
      careerData.responsibilities = [];
    }
    
    // Handle salaryRange
    if (careerData.salaryRange) {
      if (careerData.salaryRange.min === '' || careerData.salaryRange.min === null || careerData.salaryRange.min === undefined) {
        careerData.salaryRange.min = undefined;
      }
      if (careerData.salaryRange.max === '' || careerData.salaryRange.max === null || careerData.salaryRange.max === undefined) {
        careerData.salaryRange.max = undefined;
      }
    }
    
    // Ensure required fields
    if (!careerData.position || !careerData.department || !careerData.location || 
        !careerData.description || !careerData.applicationDeadline) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Position, department, location, description, and application deadline are required'
      });
    }

    // Validate requirements and responsibilities have at least one item
    if (careerData.requirements.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'At least one requirement is required'
      });
    }
    
    if (careerData.responsibilities.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'At least one responsibility is required'
      });
    }
    
    const career = new Career(careerData);
    await career.save();
    
    console.log('Career created successfully:', career._id);
    
    res.status(201).json({
      success: true,
      message: 'Career created successfully',
      data: career
    });
  } catch (error) {
    console.error('Error creating career:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        messages: messages
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        message: 'Career with this position already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get all careers (PUBLIC - only active with future deadlines)
exports.getAllCareers = async (req, res) => {
  try {
    const now = new Date();
    
    const careers = await Career.find({
      isActive: true,
      applicationDeadline: { $gte: now }
    })
    .sort({ applicationDeadline: 1, createdAt: -1 })
    .select('-__v');
    
    console.log(`Found ${careers.length} active careers with future deadlines`);
    
    res.json({
      success: true,
      count: careers.length,
      data: careers
    });
  } catch (error) {
    console.error('Error fetching careers:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get career by ID
exports.getCareerById = async (req, res) => {
  try {
    const career = await Career.findById(req.params.id).select('-__v');
    
    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found'
      });
    }
    
    res.json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Error fetching career:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid career ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Update career
exports.updateCareer = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Handle arrays
    if (updates.requirements) {
      if (typeof updates.requirements === 'string') {
        updates.requirements = [updates.requirements];
      }
      updates.requirements = updates.requirements.filter(req => req && req.trim() !== '');
    }
    
    if (updates.responsibilities) {
      if (typeof updates.responsibilities === 'string') {
        updates.responsibilities = [updates.responsibilities];
      }
      updates.responsibilities = updates.responsibilities.filter(res => res && res.trim() !== '');
    }
    
    updates.updatedAt = Date.now();
    
    const career = await Career.findByIdAndUpdate(
      req.params.id,
      updates,
      { 
        new: true, 
        runValidators: true,
        select: '-__v'
      }
    );

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found'
      });
    }

    res.json({
      success: true,
      message: 'Career updated successfully',
      data: career
    });
  } catch (error) {
    console.error('Error updating career:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        messages: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Delete career (soft delete)
exports.deleteCareer = async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true, select: '-__v' }
    );

    if (!career) {
      return res.status(404).json({
        success: false,
        error: 'Career not found'
      });
    }

    res.json({
      success: true,
      message: 'Career deleted successfully',
      data: career
    });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Get all careers (ADMIN - includes inactive)
exports.getAllCareersAdmin = async (req, res) => {
  try {
    const careers = await Career.find()
      .sort({ isActive: -1, applicationDeadline: 1, createdAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      count: careers.length,
      data: careers
    });
  } catch (error) {
    console.error('Error fetching careers for admin:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

// Debug endpoint - to check careers
exports.debugCareers = async (req, res) => {
  try {
    const allCareers = await Career.find();
    const now = new Date();
    const activeCareers = await Career.find({ isActive: true });
    const futureCareers = await Career.find({
      isActive: true,
      applicationDeadline: { $gte: now }
    });
    
    res.json({
      success: true,
      debug: {
        allCareersCount: allCareers.length,
        activeCareersCount: activeCareers.length,
        futureCareersCount: futureCareers.length,
        allCareers: allCareers,
        currentTime: now,
        databaseConnected: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};