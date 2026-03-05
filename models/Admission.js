const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Course Details
  academicYear: {
    from: String,
    to: String
  },
  courseApplied: String,
  medium: {
    type: String,
    enum: ['English', 'Marathi'],
    default: 'English'
  },

  // Personal Details
  surname: String,
  firstName: String,
  fathersName: String,
  nameInDevnagari: String,
  mothersName: String,
  sex: {
    type: String,
    enum: ['Male', 'Female']
  },
  nameChange: String,
  dateOfBirth: Date,
  maritalStatus: {
    type: String,
    enum: ['Married', 'Unmarried']
  },
  bloodGroup: String,
  motherTongue: String,
  nationality: String,
  religion: String,
  maharashtrian: {
    type: String,
    enum: ['Maharashtrian', 'Non-Maharashtrian']
  },
  aadharCardNo: String,
  cast: String,
  category: String,
  belongsToCreamyLayer: {
    type: String,
    enum: ['Yes', 'No']
  },
  otherLanguages: String,

  // Address Details
  presentAddress: String,
  presentPincode: String,
  permanentAddress: String,
  permanentPincode: String,

  // Contact Details
  studentContact: String,
  phone1: String,
  phone2: String,
  email: String,

  // Subjects Offered
  subjectsOffered: String,
  lastCollegeName: String,
  lastCollegeAddress: String,

  // Academic Records
  academicRecords: [{
    srNo: Number,
    examination: String,
    boardUniversity: String,
    yearOfPassing: String,
    percentage: String
  }],

  // Declarations
  studentSignature: String,
  parentSignature: String,
  applicationDate: Date,

  // Undertaking - Fees
  feesUndertaking: {
    parentGuardianName: String,
    studentName: String,
    studentFatherName: String,
    admissionCourse: String,
    agreeFees: Boolean
  },

  // Undertaking - Attendance
  attendanceUndertaking: {
    studentName: String,
    fathersName: String,
    studyingClass: String,
    branch: String,
    rollNo: String,
    agreeAttendance: Boolean
  },

  // Documents Submitted
  documentsSubmitted: {
    gradCertificate: Boolean,
    tenthMarklist: Boolean,
    twelfthMarklist: Boolean,
    leavingCertificate: Boolean,
    migrationCertificate: Boolean,
    gapAffidavit: Boolean,
    passportPhotos: Boolean,
    casteCertificate: Boolean,
    marriageCertificate: Boolean,
    aadharCard: Boolean
  },

  // Fees Payment Schedule
  feesPayment: {
    totalFees: String,
    registrationFees: String,
    installments: [{
      amount: String,
      dueDate: Date
    }]
  },

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

module.exports = mongoose.model('Admission', admissionSchema);