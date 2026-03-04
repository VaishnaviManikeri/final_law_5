const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Academic Year
  academicYearFrom: String,
  academicYearTo: String,
  courseApplied: String,
  medium: String,

  // Personal Details
  surname: String,
  firstName: String,
  fatherName: String,
  nameInDevnagari: String,
  motherName: String,
  sex: String,
  previousName: String,
  dateOfBirth: Date,
  maritalStatus: String,
  bloodGroup: String,
  motherTongue: String,
  nationality: String,
  religion: String,
  maharashtrian: String,
  aadharCard: String,
  cast: String,
  category: String,
  creamyLayer: String,
  otherLanguages: String,

  // Address Details
  presentAddress: String,
  presentPin: String,
  permanentAddress: String,
  permanentPin: String,

  // Contact Details
  studentContact: String,
  phone1: String,
  phone2: String,
  email: String,

  // Subjects & Last College
  subjectsOffered: String,
  lastCollegeName: String,
  lastCollegeAddress: String,

  // Academic Records
  academicRecords: [{
    srNo: Number,
    examination: String,
    board: String,
    yearOfPassing: String,
    percentage: String
  }],

  // Signatures and Dates
  applicantSignature: String,
  parentSignature: String,
  date: Date,

  // Office Use Only
  officeName: String,
  officeBranch: String,
  officeAcademicYear: String,
  officeClass: String,
  officeDivision: String,
  officeDate: Date,
  officeSignature: String,
  principalSignature: String,

  // Undertakings
  parentName: String,
  studentName: String,
  courseName: String,
  
  // Student Undertaking
  studentUndertakingName: String,
  studentClass: String,
  studentBranch: String,
  studentRollNo: String,

  // Fees Schedule
  totalFees: String,
  registrationFees: String,
  feesSchedule: [{
    date: String,
    amount: String
  }],

  // Submitted Documents
  documentsSubmitted: [String],

  // Important Note
  documentsReceivedDate: Date,
  studentSignature: String,

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  applicationNumber: {
    type: String,
    unique: true
  }
});

// Generate application number before saving
admissionSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Admission').countDocuments();
    this.applicationNumber = `APP${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);