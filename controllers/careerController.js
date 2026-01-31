const Career = require('../models/Career');

// Create career
exports.createCareer = async (req, res) => {
  try {
    const careerData = req.body;
    
    // Ensure requirements and responsibilities are arrays
    if (typeof careerData.requirements === 'string') {
      careerData.requirements = [careerData.requirements];
    }
    if (typeof careerData.responsibilities === 'string') {
      careerData.responsibilities = [careerData.responsibilities];
    }
    
    // Handle salaryRange
    if (careerData.salaryRange) {
      if (careerData.salaryRange.min === '') careerData.salaryRange.min = undefined;
      if (careerData.salaryRange.max === '') careerData.salaryRange.max = undefined;
    }
    
    const career = new Career(careerData);
    await career.save();
    
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
    .select('-__v'); // Exclude version key
    
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
    const updates = req.body;
    
    // Handle arrays
    if (updates.requirements && typeof updates.requirements === 'string') {
      updates.requirements = [updates.requirements];
    }
    if (updates.responsibilities && typeof updates.responsibilities === 'string') {
      updates.responsibilities = [updates.responsibilities];
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