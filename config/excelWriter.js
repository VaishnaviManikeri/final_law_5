const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

class ExcelWriter {
  constructor() {
    this.excelDir = path.join(__dirname, '../exports');
    this.filePath = path.join(this.excelDir, 'admissions.xlsx');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.excelDir)) {
      fs.mkdirSync(this.excelDir, { recursive: true });
    }
  }

  flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix.length ? `${prefix}_` : '';
      
      if (obj[key] === null || obj[key] === undefined) {
        acc[`${pre}${key}`] = '';
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        // Handle nested objects (like documents)
        if (key === 'documents') {
          Object.keys(obj[key]).forEach(docKey => {
            acc[`${pre}${key}_${docKey}`] = obj[key][docKey]?.filename || '';
          });
        } else {
          Object.assign(acc, this.flattenObject(obj[key], `${pre}${key}`));
        }
      } else if (Array.isArray(obj[key])) {
        // Handle arrays (academic records, fee installments)
        obj[key].forEach((item, index) => {
          if (typeof item === 'object') {
            Object.keys(item).forEach(itemKey => {
              acc[`${pre}${key}_${index + 1}_${itemKey}`] = item[itemKey] || '';
            });
          } else {
            acc[`${pre}${key}_${index + 1}`] = item || '';
          }
        });
      } else {
        acc[`${pre}${key}`] = obj[key] || '';
      }
      
      return acc;
    }, {});
  }

  async appendToExcel(data) {
    try {
      let workbook;
      let worksheet;
      
      // Flatten the data
      const flatData = this.flattenObject(data);
      
      // Add metadata
      flatData.application_number = data.applicationNumber;
      flatData.submitted_at = new Date(data.submittedAt).toLocaleString();
      
      // Check if file exists
      if (fs.existsSync(this.filePath)) {
        // Read existing workbook
        workbook = XLSX.readFile(this.filePath);
        worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON to append data
        const existingData = XLSX.utils.sheet_to_json(worksheet);
        
        // Append new data
        existingData.push(flatData);
        
        // Create new worksheet
        const newWorksheet = XLSX.utils.json_to_sheet(existingData);
        workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
      } else {
        // Create new workbook with headers
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.json_to_sheet([flatData]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions');
      }
      
      // Write to file
      XLSX.writeFile(workbook, this.filePath);
      
      console.log(`✅ Excel file updated: ${this.filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Error writing to Excel:', error);
      throw error;
    }
  }

  async getAllAdmissionsFromExcel() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      
      const workbook = XLSX.readFile(this.filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      console.error('❌ Error reading Excel:', error);
      return [];
    }
  }
}

module.exports = new ExcelWriter();