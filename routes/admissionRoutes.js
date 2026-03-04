const express = require("express");
const router = express.Router();

const {
submitAdmission,
downloadExcel
} = require("../controllers/admissionController");

router.post("/submit", submitAdmission);

router.get("/download", downloadExcel);

module.exports = router;