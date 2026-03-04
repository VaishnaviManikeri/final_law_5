const mongoose = require('mongoose');

const AcademicRecordSchema = new mongoose.Schema({
  exam: { type: String, default: '' },
  board: { type: String, default: '' },
  year: { type: String, default: '' },
  percentage: { type: String, default: '' }
});

const FeeInstallmentSchema = new mongoose.Schema({
  day: { type: String, default: '' },
  month: { type: String, default: '' },
  year: { type: String, default: '' },
  amount: { type: String, default: '' }
});

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, default: '' },
  path: { type: String, default: '' },
  mimetype: { type: String, default: '' },
  size: { type: Number, default: 0 }
});

const AdmissionSchema = new mongoose.Schema({
  // Academic
  academicYearFrom: { type: String, default: '' },
  academicYearTo: { type: String, default: '' },
  course: { type: String, default: '' },
  medium: { type: String, default: '' },
  
  // Personal
  surname: { type: String, default: '' },
  firstName: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  nameDevnagari: { type: String, default: '' },
  motherName: { type: String, default: '' },
  sex: { type: String, default: '' },
  nameChange: { type: String, default: '' },
  dobDay: { type: String, default: '' },
  dobMonth: { type: String, default: '' },
  dobYear: { type: String, default: '' },
  maritalStatus: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  motherTongue: { type: String, default: '' },
  nationality: { type: String, default: '' },
  religion: { type: String, default: '' },
  region: { type: String, default: '' },
  aadhar: { type: String, default: '' },
  cast: { type: String, default: '' },
  category: { type: String, default: '' },
  categoryOther: { type: String, default: '' },
  creamyLayer: { type: String, default: '' },
  otherLanguages: { type: String, default: '' },
  
  // Address
  presentAddress: { type: String, default: '' },
  presentPin: { type: String, default: '' },
  permanentAddress: { type: String, default: '' },
  permanentPin: { type: String, default: '' },
  
  // Contact
  studentContact: { type: String, default: '' },
  phone1: { type: String, default: '' },
  phone2: { type: String, default: '' },
  email: { type: String, default: '' },
  
  // Subjects & College
  subjectsOffered: { type: String, default: '' },
  lastCollege: { type: String, default: '' },
  
  // Academic Records
  academic: { type: [AcademicRecordSchema], default: [] },
  
  // Signatures
  applicantSignature: { type: String, default: '' },
  parentSignature: { type: String, default: '' },
  declarationDate: { type: String, default: '' },
  
  // Office use
  officeMr: { type: String, default: '' },
  officeBranch: { type: String, default: '' },
  officeYearFrom: { type: String, default: '' },
  officeYearTo: { type: String, default: '' },
  officeClass: { type: String, default: '' },
  officeDiv: { type: String, default: '' },
  officeDate: { type: String, default: '' },
  officeAdmissionSign: { type: String, default: '' },
  officePrincipalSign: { type: String, default: '' },
  
  // Undertaking fees
  feesMrMrs: { type: String, default: '' },
  feesStudentName: { type: String, default: '' },
  feesFatherName: { type: String, default: '' },
  feesCourse: { type: String, default: '' },
  feesMrMrs2: { type: String, default: '' },
  feesStudentSign: { type: String, default: '' },
  feesParentSign: { type: String, default: '' },
  
  // Undertaking attendance
  attendanceName: { type: String, default: '' },
  attendanceFather: { type: String, default: '' },
  attendanceClass: { type: String, default: '' },
  attendanceBranch: { type: String, default: '' },
  attendanceRollNo: { type: String, default: '' },
  attendanceParentSign: { type: String, default: '' },
  attendanceStudentSign: { type: String, default: '' },
  
  // Fees schedule
  totalFees: { type: String, default: '' },
  registrationFees: { type: String, default: '' },
  feeInstallments: { type: [FeeInstallmentSchema], default: [] },
  
  // Final
  finalSignature: { type: String, default: '' },
  finalDate: { type: String, default: '' },
  
  // Documents
  documents: {
    gradCertificate: { type: DocumentSchema, default: {} },
    marksheet10: { type: DocumentSchema, default: {} },
    marksheet12: { type: DocumentSchema, default: {} },
    leavingCertificate: { type: DocumentSchema, default: {} },
    migrationCertificate: { type: DocumentSchema, default: {} },
    gapAffidavit: { type: DocumentSchema, default: {} },
    photo: { type: DocumentSchema, default: {} },
    casteCertificate: { type: DocumentSchema, default: {} },
    marriageCertificate: { type: DocumentSchema, default: {} },
    aadharCard: { type: DocumentSchema, default: {} }
  },
  
  // Metadata
  applicationNumber: { type: String, unique: true },
  submittedAt: { type: Date, default: Date.now },
  ipAddress: { type: String, default: '' }
});

// Generate application number before saving
AdmissionSchema.pre('save', async function(next) {
  if (!this.applicationNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = await mongoose.model('Admission').countDocuments();
    this.applicationNumber = `APP${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Admission', AdmissionSchema);