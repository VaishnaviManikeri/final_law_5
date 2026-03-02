const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Personal Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  
  // Academic Information
  course: { 
    type: String, 
    enum: ['BA_LLB', 'BBA_LLB', 'BCom_LLB'],
    default: 'BA_LLB'
  },
  year: { type: String, default: '2026' },
  tenthPercentage: { type: Number },
  twelfthPercentage: { type: Number },
  twelfthStream: { type: String, enum: ['Science', 'Commerce', 'Arts'] },
  board: { type: String },
  category: { type: String },
  
  // Address Information
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  
  // Guardian Information
  guardianName: { type: String },
  guardianPhone: { type: String },
  
  // Additional Information
  message: { type: String },
  howDidYouHear: { type: String },
  
  // Form Type
  formType: { 
    type: String, 
    enum: ['enquiry', 'admission'],
    required: true 
  },
  
  // Timestamps
  submittedAt: { type: Date, default: Date.now },
  
  // IP Address and User Agent (optional)
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admission', admissionSchema);