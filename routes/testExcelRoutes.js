const express = require('express');
const router = express.Router();
const excelService = require('../services/excelService');
const fs = require('fs');

// Test Excel functionality
router.get('/excel', (req, res) => {
  try {
    const excelPath = excelService.getExcelPath();
    const exists = fs.existsSync(excelPath);
    
    res.json({
      success: true,
      message: 'Excel service is working',
      excelFile: {
        path: excelPath,
        exists: exists,
        writable: fs.accessSync(excelPath, fs.constants.W_OK) ? false : true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test write to Excel
router.post('/excel/test-write', async (req, res) => {
  try {
    const testData = {
      applicationNumber: 'TEST' + Date.now(),
      firstName: 'Test',
      surname: 'User',
      submittedAt: new Date(),
      academicRecords: []
    };
    
    await excelService.appendToExcel(testData);
    
    res.json({
      success: true,
      message: 'Test data written to Excel'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;