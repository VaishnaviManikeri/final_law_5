const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelService {
  constructor() {
    this.excelDir = path.join(__dirname, '../exports');
    this.excelPath = path.join(this.excelDir, 'admissions.xlsx');
    
    // Create exports directory if it doesn't exist
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
    }
  }

  // Initialize Excel file with headers
  initializeExcel() {
    if (!fs.existsSync(this.excelPath)) {
      const headers = [
        ['Application No.', 'Date', 'Academic Year', 'Course', 'Medium', 
         'Surname', 'First Name', 'Father\'s Name', 'Mother\'s Name', 
         'Date of Birth', 'Sex', 'Marital Status', 'Nationality', 'Religion',
         'Aadhar Card', 'Cast', 'Category', 'Creamy Layer',
         'Present Address', 'Present Pin', 'Permanent Address', 'Permanent Pin',
         'Student Contact', 'Phone 1', 'Phone 2', 'Email',
         'Subjects Offered', 'Last College',
         '10th Examination', '10th Board', '10th Year', '10th Percentage',
         '12th Examination', '12th Board', '12th Year', '12th Percentage',
         'Graduation Examination', 'Graduation Board', 'Graduation Year', 'Graduation Percentage',
         'Applicant Signature', 'Parent Signature', 'Submission Date']
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(headers);
      XLSX.utils.book_append_sheet(wb, ws, 'Admissions');
      XLSX.writeFile(wb, this.excelPath);
    }
  }

  // Append admission data to Excel
  async appendToExcel(admissionData) {
    try {
      this.initializeExcel();

      // Read existing workbook
      const wb = XLSX.readFile(this.excelPath);
      const ws = wb.Sheets['Admissions'];
      
      // Convert sheet to JSON to get existing data
      const existingData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Prepare new row data
      const academicRecords = admissionData.academicRecords || [];
      const record10 = academicRecords.find(r => r.srNo === 1) || {};
      const record12 = academicRecords.find(r => r.srNo === 2) || {};
      const recordGrad = academicRecords.find(r => r.srNo === 3) || {};

      const newRow = [
        admissionData.applicationNumber || '',
        new Date(admissionData.submittedAt).toLocaleDateString(),
        `${admissionData.academicYearFrom || ''}-${admissionData.academicYearTo || ''}`,
        admissionData.courseApplied || '',
        admissionData.medium || '',
        admissionData.surname || '',
        admissionData.firstName || '',
        admissionData.fatherName || '',
        admissionData.motherName || '',
        admissionData.dateOfBirth ? new Date(admissionData.dateOfBirth).toLocaleDateString() : '',
        admissionData.sex || '',
        admissionData.maritalStatus || '',
        admissionData.nationality || '',
        admissionData.religion || '',
        admissionData.aadharCard || '',
        admissionData.cast || '',
        admissionData.category || '',
        admissionData.creamyLayer || '',
        admissionData.presentAddress || '',
        admissionData.presentPin || '',
        admissionData.permanentAddress || '',
        admissionData.permanentPin || '',
        admissionData.studentContact || '',
        admissionData.phone1 || '',
        admissionData.phone2 || '',
        admissionData.email || '',
        admissionData.subjectsOffered || '',
        admissionData.lastCollegeName || '',
        record10.examination || '',
        record10.board || '',
        record10.yearOfPassing || '',
        record10.percentage || '',
        record12.examination || '',
        record12.board || '',
        record12.yearOfPassing || '',
        record12.percentage || '',
        recordGrad.examination || '',
        recordGrad.board || '',
        recordGrad.yearOfPassing || '',
        recordGrad.percentage || '',
        admissionData.applicantSignature || '',
        admissionData.parentSignature || '',
        new Date().toLocaleDateString()
      ];

      // Append new row
      existingData.push(newRow);
      
      // Create new sheet with updated data
      const newWs = XLSX.utils.aoa_to_sheet(existingData);
      wb.Sheets['Admissions'] = newWs;
      
      // Save workbook
      XLSX.writeFile(wb, this.excelPath);
      
      return true;
    } catch (error) {
      console.error('Error appending to Excel:', error);
      throw error;
    }
  }

  // Get Excel file path
  getExcelPath() {
    this.initializeExcel();
    return this.excelPath;
  }
}

module.exports = new ExcelService();