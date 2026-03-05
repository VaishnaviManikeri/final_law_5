const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelGenerator {
  constructor() {
    this.filePath = path.join(__dirname, '../uploads/admission.xlsx');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Convert admission data to flat object for Excel
  formatDataForExcel(admissionData) {
    const academicRecords = admissionData.academicRecords || [];
    const feesInstallments = admissionData.feesPayment?.installments || [];

    return {
      // Course Details
      'Academic Year': `${admissionData.academicYear?.from || ''}-${admissionData.academicYear?.to || ''}`,
      'Course Applied': admissionData.courseApplied || '',
      'Medium': admissionData.medium || '',

      // Personal Details
      'Surname': admissionData.surname || '',
      'First Name': admissionData.firstName || '',
      "Father's Name": admissionData.fathersName || '',
      'Name in Devnagari': admissionData.nameInDevnagari || '',
      "Mother's Name": admissionData.mothersName || '',
      'Sex': admissionData.sex || '',
      'Name Change': admissionData.nameChange || '',
      'Date of Birth': admissionData.dateOfBirth ? new Date(admissionData.dateOfBirth).toLocaleDateString() : '',
      'Marital Status': admissionData.maritalStatus || '',
      'Blood Group': admissionData.bloodGroup || '',
      'Mother Tongue': admissionData.motherTongue || '',
      'Nationality': admissionData.nationality || '',
      'Religion': admissionData.religion || '',
      'Maharashtrian': admissionData.maharashtrian || '',
      'Aadhar Card No': admissionData.aadharCardNo || '',
      'Cast': admissionData.cast || '',
      'Category': admissionData.category || '',
      'Belongs to Creamy Layer': admissionData.belongsToCreamyLayer || '',
      'Other Languages': admissionData.otherLanguages || '',

      // Address
      'Present Address': admissionData.presentAddress || '',
      'Present Pincode': admissionData.presentPincode || '',
      'Permanent Address': admissionData.permanentAddress || '',
      'Permanent Pincode': admissionData.permanentPincode || '',

      // Contact
      'Student Contact': admissionData.studentContact || '',
      'Phone 1': admissionData.phone1 || '',
      'Phone 2': admissionData.phone2 || '',
      'Email': admissionData.email || '',

      // Academic Info
      'Subjects Offered': admissionData.subjectsOffered || '',
      'Last College Name': admissionData.lastCollegeName || '',
      'Last College Address': admissionData.lastCollegeAddress || '',

      // Academic Records
      'Exam 1': academicRecords[0]?.examination || '',
      'Board 1': academicRecords[0]?.boardUniversity || '',
      'Year 1': academicRecords[0]?.yearOfPassing || '',
      'Percentage 1': academicRecords[0]?.percentage || '',
      
      'Exam 2': academicRecords[1]?.examination || '',
      'Board 2': academicRecords[1]?.boardUniversity || '',
      'Year 2': academicRecords[1]?.yearOfPassing || '',
      'Percentage 2': academicRecords[1]?.percentage || '',
      
      'Exam 3': academicRecords[2]?.examination || '',
      'Board 3': academicRecords[2]?.boardUniversity || '',
      'Year 3': academicRecords[2]?.yearOfPassing || '',
      'Percentage 3': academicRecords[2]?.percentage || '',

      // Fees
      'Total Fees': admissionData.feesPayment?.totalFees || '',
      'Registration Fees': admissionData.feesPayment?.registrationFees || '',
      'Installment 1': feesInstallments[0]?.amount || '',
      'Installment 1 Due': feesInstallments[0]?.dueDate ? new Date(feesInstallments[0].dueDate).toLocaleDateString() : '',
      'Installment 2': feesInstallments[1]?.amount || '',
      'Installment 2 Due': feesInstallments[1]?.dueDate ? new Date(feesInstallments[1].dueDate).toLocaleDateString() : '',

      // Submission Info
      'Submitted At': new Date(admissionData.submittedAt).toLocaleString(),
      'IP Address': admissionData.ipAddress || ''
    };
  }

  // Initialize Excel file with headers if it doesn't exist
  initializeExcelFile() {
    if (!fs.existsSync(this.filePath)) {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([this.getHeaders()]);
      XLSX.utils.book_append_sheet(wb, ws, 'Admissions');
      XLSX.writeFile(wb, this.filePath);
    }
  }

  getHeaders() {
    return [
      'Academic Year', 'Course Applied', 'Medium', 'Surname', 'First Name',
      "Father's Name", 'Name in Devnagari', "Mother's Name", 'Sex', 'Name Change',
      'Date of Birth', 'Marital Status', 'Blood Group', 'Mother Tongue', 'Nationality',
      'Religion', 'Maharashtrian', 'Aadhar Card No', 'Cast', 'Category',
      'Belongs to Creamy Layer', 'Other Languages', 'Present Address', 'Present Pincode',
      'Permanent Address', 'Permanent Pincode', 'Student Contact', 'Phone 1', 'Phone 2',
      'Email', 'Subjects Offered', 'Last College Name', 'Last College Address',
      'Exam 1', 'Board 1', 'Year 1', 'Percentage 1',
      'Exam 2', 'Board 2', 'Year 2', 'Percentage 2',
      'Exam 3', 'Board 3', 'Year 3', 'Percentage 3',
      'Total Fees', 'Registration Fees', 'Installment 1', 'Installment 1 Due',
      'Installment 2', 'Installment 2 Due', 'Submitted At', 'IP Address'
    ];
  }

  // Add new row to Excel file
  async addRow(admissionData) {
    try {
      this.initializeExcelFile();

      // Read existing workbook
      const wb = XLSX.readFile(this.filePath);
      const ws = wb.Sheets['Admissions'];
      
      // Convert to JSON to get current rows
      const existingData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Format new data
      const newRow = this.formatDataForExcel(admissionData);
      const newRowArray = this.getHeaders().map(header => newRow[header] || '');
      
      // Append new row
      existingData.push(newRowArray);
      
      // Create new worksheet
      const newWs = XLSX.utils.aoa_to_sheet(existingData);
      wb.Sheets['Admissions'] = newWs;
      
      // Write back to file
      XLSX.writeFile(wb, this.filePath);
      
      return true;
    } catch (error) {
      console.error('Error writing to Excel:', error);
      throw error;
    }
  }

  // Get all data from Excel file
  async getAllData() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }

      const wb = XLSX.readFile(this.filePath);
      const ws = wb.Sheets['Admissions'];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Remove header row and return data
      return data.slice(1).map(row => {
        const obj = {};
        this.getHeaders().forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      console.error('Error reading Excel file:', error);
      return [];
    }
  }

  // Download Excel file
  getExcelFilePath() {
    return this.filePath;
  }
}

module.exports = new ExcelGenerator();