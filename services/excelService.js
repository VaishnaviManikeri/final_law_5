const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class ExcelService {
  constructor() {
    this.excelDir = path.join(__dirname, '../../excel-exports');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
    }
  }

  generateExcelFileName() {
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    return `admissions_${formattedDate}.xlsx`;
  }

  convertToExcelData(admissionData) {
    return admissionData.map(record => ({
      'Submission ID': record._id?.toString() || '',
      'Form Type': record.formType === 'admission' ? 'Full Application' : 'Quick Enquiry',
      'Submission Date': new Date(record.submittedAt).toLocaleString(),
      'First Name': record.firstName || '',
      'Last Name': record.lastName || '',
      'Full Name': `${record.firstName || ''} ${record.lastName || ''}`.trim(),
      'Email': record.email || '',
      'Phone': record.phone || '',
      'Date of Birth': record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString() : '',
      'Gender': record.gender || '',
      'Course': this.formatCourse(record.course),
      'Admission Year': record.year || '',
      '10th Percentage': record.tenthPercentage || '',
      '12th Percentage': record.twelfthPercentage || '',
      '12th Stream': record.twelfthStream || '',
      'Board': record.board || '',
      'Category': record.category || '',
      'Address': record.address || '',
      'City': record.city || '',
      'State': record.state || '',
      'Pincode': record.pincode || '',
      'Guardian Name': record.guardianName || '',
      'Guardian Phone': record.guardianPhone || '',
      'Message/Query': record.message || '',
      'How Did You Hear': record.howDidYouHear || '',
      'IP Address': record.ipAddress || '',
      'User Agent': record.userAgent || ''
    }));
  }

  formatCourse(course) {
    const courses = {
      'BA_LLB': '5-Year B.A. LL.B',
      'BBA_LLB': '5-Year B.B.A. LL.B',
      'BCom_LLB': '5-Year B.Com LL.B'
    };
    return courses[course] || course;
  }

  async createExcelFile(data, fileName) {
    try {
      const filePath = path.join(this.excelDir, fileName);
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions');
      
      // Write to file
      XLSX.writeFile(workbook, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error creating Excel file:', error);
      throw error;
    }
  }

  async appendToExcel(newData) {
    try {
      const fileName = this.generateExcelFileName();
      const filePath = path.join(this.excelDir, fileName);
      
      let existingData = [];
      
      // Read existing file if it exists
      if (fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        existingData = XLSX.utils.sheet_to_json(worksheet);
      }
      
      // Combine existing and new data
      const allData = [...existingData, ...newData];
      
      // Create new worksheet
      const worksheet = XLSX.utils.json_to_sheet(allData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions');
      
      // Write to file
      XLSX.writeFile(workbook, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error appending to Excel:', error);
      throw error;
    }
  }

  async getAllAdmissionsExcel(allAdmissions) {
    try {
      const fileName = `all_admissions_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(this.excelDir, fileName);
      
      const excelData = this.convertToExcelData(allAdmissions);
      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'All Admissions');
      
      // Adjust column widths
      const maxWidth = 50;
      const columnWidths = [];
      for (let i = 0; i < Object.keys(excelData[0] || {}).length; i++) {
        columnWidths.push({ wch: Math.min(30, maxWidth) });
      }
      worksheet['!cols'] = columnWidths;
      
      XLSX.writeFile(workbook, filePath);
      
      return filePath;
    } catch (error) {
      console.error('Error creating all admissions Excel:', error);
      throw error;
    }
  }
}

module.exports = new ExcelService();