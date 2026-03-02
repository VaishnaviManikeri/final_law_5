const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excel file path
const excelFilePath = path.join(__dirname, '../admissions.xlsx');

// Helper function to create file if not exists
const ensureExcelFile = () => {
  if (!fs.existsSync(excelFilePath)) {
    const workbook = XLSX.utils.book_new();

    const headers = [[
      "Form Type",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Course",
      "Year",
      "Date Of Birth",
      "Gender",
      "10th %",
      "12th %",
      "12th Stream",
      "Board",
      "Category",
      "Address",
      "City",
      "State",
      "Pincode",
      "Guardian Name",
      "Guardian Phone",
      "How Did You Hear",
      "Message",
      "Submitted At"
    ]];

    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admissions");
    XLSX.writeFile(workbook, excelFilePath);
  }
};

// POST /api/admission
router.post('/', async (req, res) => {
  try {
    ensureExcelFile();

    const {
      formType,
      firstName,
      lastName,
      email,
      phone,
      course,
      year,
      dateOfBirth,
      gender,
      tenthPercentage,
      twelfthPercentage,
      twelfthStream,
      board,
      category,
      address,
      city,
      state,
      pincode,
      guardianName,
      guardianPhone,
      howDidYouHear,
      message
    } = req.body;

    const workbook = XLSX.readFile(excelFilePath);
    const worksheet = workbook.Sheets["Admissions"];

    const newRow = [[
      formType || "",
      firstName || "",
      lastName || "",
      email || "",
      phone || "",
      course || "",
      year || "",
      dateOfBirth || "",
      gender || "",
      tenthPercentage || "",
      twelfthPercentage || "",
      twelfthStream || "",
      board || "",
      category || "",
      address || "",
      city || "",
      state || "",
      pincode || "",
      guardianName || "",
      guardianPhone || "",
      howDidYouHear || "",
      message || "",
      new Date().toLocaleString()
    ]];

    const existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const updatedData = [...existingData, ...newRow];

    const newWorksheet = XLSX.utils.aoa_to_sheet(updatedData);
    workbook.Sheets["Admissions"] = newWorksheet;

    XLSX.writeFile(workbook, excelFilePath);

    return res.status(200).json({
      success: true,
      message: "Form submitted successfully"
    });

  } catch (error) {
    console.error("Admission submission error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to submit form"
    });
  }
});

module.exports = router;