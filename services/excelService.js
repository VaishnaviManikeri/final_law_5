const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const os = require('os');

class ExcelService {
  constructor() {
    // Use a more reliable path - temp directory or absolute path
    this.excelDir = this.getWritableDirectory();
    this.excelPath = path.join(this.excelDir, 'admissions.xlsx');
    
    console.log('Excel directory:', this.excelDir);
    console.log('Excel file path:', this.excelPath);
    
    // Initialize on creation
    this.initialize();
  }

  getWritableDirectory() {
    // Try multiple possible writable locations
    const possiblePaths = [
      path.join(__dirname, '../../exports'),
      path.join(process.cwd(), 'exports'),
      path.join(os.tmpdir(), 'admission-exports'),
      '/tmp/admission-exports' // For Linux/Unix systems
    ];

    for (const dirPath of possiblePaths) {
      try {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true, mode: 0o777 });
        }
        
        // Test if directory is writable
        const testFile = path.join(dirPath, 'test.txt');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
        console.log('Found writable directory:', dirPath);
        return dirPath;
      } catch (error) {
        console.log(`Directory ${dirPath} not writable:`, error.message);
        // Continue to next path
      }
    }

    // Fallback to current directory
    console.log('Using current directory as fallback');
    return process.cwd();
  }

  initialize() {
    try {
      if (!fs.existsSync(this.excelPath)) {
        this.createNewExcelFile();
      } else {
        // Verify existing file is valid
        try {
          XLSX.readFile(this.excelPath);
          console.log('Existing Excel file is valid');
        } catch (error) {
          console.log('Existing Excel file is corrupted, creating new one');
          this.createNewExcelFile();
        }
      }
    } catch (error) {
      console.error('Error initializing Excel:', error);
    }
  }

  createNewExcelFile() {
    console.log('Creating new Excel file at:', this.excelPath);
    
    const headers = this.getExcelHeaders();
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    
    // Set column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Admissions');
    XLSX.writeFile(wb, this.excelPath);
    
    console.log('Excel file created successfully');
  }

  getExcelHeaders() {
    return [
      'Application No.', 'Submission Date', 'Academic Year', 'Course Applied', 'Medium',
      'Surname', 'First Name', 'Father\'s Name', 'Name in Devnagari', 'Mother\'s Name',
      'Sex', 'Previous Name', 'Date of Birth', 'Marital Status', 'Blood Group',
      'Mother Tongue', 'Nationality', 'Religion', 'Maharashtrian', 'Aadhar Card',
      'Cast', 'Category', 'Creamy Layer', 'Other Languages',
      'Present Address', 'Present Pin', 'Permanent Address', 'Permanent Pin',
      'Student Contact', 'Phone 1', 'Phone 2', 'Email',
      'Subjects Offered', 'Last College Name', 'Last College Address',
      '10th Examination', '10th Board', '10th Year', '10th Percentage',
      '12th Examination', '12th Board', '12th Year', '12th Percentage',
      'Graduation Examination', 'Graduation Board', 'Graduation Year', 'Graduation Percentage',
      'Applicant Signature', 'Parent Signature', 'Date',
      'Office Name', 'Office Branch', 'Office Academic Year', 'Office Class',
      'Office Division', 'Office Date', 'Office Signature', 'Principal Signature',
      'Parent Name', 'Student Name', 'Course Name',
      'Student Undertaking Name', 'Student Class', 'Student Branch', 'Student Roll No',
      'Total Fees', 'Registration Fees',
      'Documents Received Date', 'Student Signature'
    ];
  }

  async appendToExcel(admissionData) {
    let tempFilePath = null;
    
    try {
      console.log('Attempting to append to Excel:', admissionData.applicationNumber);
      
      // Ensure file exists
      this.initialize();

      // Read existing workbook
      const wb = XLSX.readFile(this.excelPath);
      const ws = wb.Sheets['Admissions'];
      
      // Convert sheet to JSON to get existing data
      const existingData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // Prepare new row data
      const newRow = this.prepareRowData(admissionData);

      // Append new row
      existingData.push(newRow);
      
      // Create new sheet with updated data
      const newWs = XLSX.utils.aoa_to_sheet(existingData);
      
      // Set column widths
      const colWidths = newRow.map(() => ({ wch: 20 }));
      newWs['!cols'] = colWidths;
      
      wb.Sheets['Admissions'] = newWs;
      
      // Write to a temporary file first
      tempFilePath = this.excelPath + '.tmp';
      XLSX.writeFile(wb, tempFilePath);
      
      // Replace original with temp file
      fs.renameSync(tempFilePath, this.excelPath);
      
      console.log('Successfully appended to Excel file');
      return true;
      
    } catch (error) {
      console.error('Error appending to Excel:', error);
      
      // Clean up temp file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }
      
      // Try to recreate file if it's corrupted
      try {
        console.log('Attempting to recreate Excel file...');
        this.createNewExcelFile();
        
        // Try to append again
        const wb = XLSX.readFile(this.excelPath);
        const ws = wb.Sheets['Admissions'];
        const existingData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const newRow = this.prepareRowData(admissionData);
        
        existingData.push(newRow);
        const newWs = XLSX.utils.aoa_to_sheet(existingData);
        newWs['!cols'] = newRow.map(() => ({ wch: 20 }));
        wb.Sheets['Admissions'] = newWs;
        
        XLSX.writeFile(wb, this.excelPath);
        console.log('Successfully recreated and appended to Excel');
        return true;
      } catch (recreateError) {
        console.error('Failed to recreate Excel file:', recreateError);
        throw error;
      }
    }
  }

  prepareRowData(admissionData) {
    const academicRecords = admissionData.academicRecords || [];
    const record10 = academicRecords.find(r => r.srNo === 1) || {};
    const record12 = academicRecords.find(r => r.srNo === 2) || {};
    const recordGrad = academicRecords.find(r => r.srNo === 3) || {};

    return [
      admissionData.applicationNumber || '',
      admissionData.submittedAt ? new Date(admissionData.submittedAt).toLocaleString() : '',
      `${admissionData.academicYearFrom || ''}-${admissionData.academicYearTo || ''}`,
      admissionData.courseApplied || '',
      admissionData.medium || '',
      admissionData.surname || '',
      admissionData.firstName || '',
      admissionData.fatherName || '',
      admissionData.nameInDevnagari || '',
      admissionData.motherName || '',
      admissionData.sex || '',
      admissionData.previousName || '',
      admissionData.dateOfBirth ? new Date(admissionData.dateOfBirth).toLocaleDateString() : '',
      admissionData.maritalStatus || '',
      admissionData.bloodGroup || '',
      admissionData.motherTongue || '',
      admissionData.nationality || '',
      admissionData.religion || '',
      admissionData.maharashtrian || '',
      admissionData.aadharCard || '',
      admissionData.cast || '',
      admissionData.category || '',
      admissionData.creamyLayer || '',
      admissionData.otherLanguages || '',
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
      admissionData.lastCollegeAddress || '',
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
      admissionData.date ? new Date(admissionData.date).toLocaleDateString() : '',
      admissionData.officeName || '',
      admissionData.officeBranch || '',
      admissionData.officeAcademicYear || '',
      admissionData.officeClass || '',
      admissionData.officeDivision || '',
      admissionData.officeDate ? new Date(admissionData.officeDate).toLocaleDateString() : '',
      admissionData.officeSignature || '',
      admissionData.principalSignature || '',
      admissionData.parentName || '',
      admissionData.studentName || '',
      admissionData.courseName || '',
      admissionData.studentUndertakingName || '',
      admissionData.studentClass || '',
      admissionData.studentBranch || '',
      admissionData.studentRollNo || '',
      admissionData.totalFees || '',
      admissionData.registrationFees || '',
      admissionData.documentsReceivedDate ? new Date(admissionData.documentsReceivedDate).toLocaleDateString() : '',
      admissionData.studentSignature || ''
    ];
  }

  // Get Excel file path
  getExcelPath() {
    this.initialize();
    return this.excelPath;
  }
}

// Export as singleton
module.exports = new ExcelService();