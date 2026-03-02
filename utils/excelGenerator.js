const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelGenerator {
  constructor() {
    this.excelDir = path.join(__dirname, '../uploads/excel');
    this.excelPath = path.join(this.excelDir, 'admissions.xlsx');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
    }
  }

  // Format date for Excel
  formatDate(date) {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Convert admission data to worksheet format
  formatAdmissionData(admission) {
    return {
      'Submission ID': admission._id.toString(),
      'Form Type': admission.formType === 'admission' ? 'Full Application' : 'Quick Enquiry',
      'Submitted At': this.formatDate(admission.submittedAt),
      'First Name': admission.firstName,
      'Last Name': admission.lastName,
      'Email': admission.email,
      'Phone': admission.phone,
      'Date of Birth': admission.dateOfBirth ? new Date(admission.dateOfBirth).toLocaleDateString('en-IN') : 'N/A',
      'Gender': admission.gender || 'N/A',
      'Course': admission.course.replace('_', ' '),
      'Year': admission.year,
      '10th Percentage': admission.tenthPercentage || 'N/A',
      '12th Percentage': admission.twelfthPercentage || 'N/A',
      '12th Stream': admission.twelfthStream || 'N/A',
      'Board': admission.board || 'N/A',
      'Category': admission.category || 'N/A',
      'Address': admission.address || 'N/A',
      'City': admission.city || 'N/A',
      'State': admission.state || 'N/A',
      'Pincode': admission.pincode || 'N/A',
      'Guardian Name': admission.guardianName || 'N/A',
      'Guardian Phone': admission.guardianPhone || 'N/A',
      'Message/Enquiry': admission.message || 'N/A',
      'How Did You Hear': admission.howDidYouHear || 'N/A',
      'IP Address': admission.ipAddress || 'N/A'
    };
  }

  // Create new Excel file with all admissions
  async createExcelFile(admissions) {
    try {
      const worksheetData = admissions.map(admission => this.formatAdmissionData(admission));
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      // Auto-size columns (basic implementation)
      const colWidths = [];
      if (worksheetData.length > 0) {
        const headers = Object.keys(worksheetData[0]);
        headers.forEach(header => {
          const maxLength = Math.max(
            header.length,
            ...worksheetData.map(row => String(row[header]).length)
          );
          colWidths.push({ wch: Math.min(maxLength + 2, 50) });
        });
        worksheet['!cols'] = colWidths;
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions');
      
      // Write to file
      XLSX.writeFile(workbook, this.excelPath);
      
      return this.excelPath;
    } catch (error) {
      console.error('Error creating Excel file:', error);
      throw error;
    }
  }

  // Append new admission to existing Excel file
  async appendToExcel(admission) {
    try {
      let workbook;
      let worksheet;
      
      // Check if file exists
      if (fs.existsSync(this.excelPath)) {
        // Read existing file
        workbook = XLSX.readFile(this.excelPath);
        worksheet = workbook.Sheets['Admissions'];
        
        // Convert to JSON, add new data, convert back
        const existingData = XLSX.utils.sheet_to_json(worksheet);
        existingData.push(this.formatAdmissionData(admission));
        
        // Create new worksheet with all data
        worksheet = XLSX.utils.json_to_sheet(existingData);
      } else {
        // Create new file
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.json_to_sheet([this.formatAdmissionData(admission)]);
      }
      
      // Auto-size columns
      const worksheetData = XLSX.utils.sheet_to_json(worksheet);
      if (worksheetData.length > 0) {
        const colWidths = [];
        const headers = Object.keys(worksheetData[0]);
        headers.forEach(header => {
          const maxLength = Math.max(
            header.length,
            ...worksheetData.map(row => String(row[header]).length)
          );
          colWidths.push({ wch: Math.min(maxLength + 2, 50) });
        });
        worksheet['!cols'] = colWidths;
      }
      
      // Update workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions');
      XLSX.writeFile(workbook, this.excelPath);
      
      return this.excelPath;
    } catch (error) {
      console.error('Error appending to Excel:', error);
      throw error;
    }
  }

  // Get Excel file path
  getExcelPath() {
    return this.excelPath;
  }
}

module.exports = new ExcelGenerator();