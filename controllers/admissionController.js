const Admission = require("../models/Admission");
const appendToExcel = require("../utils/excelService");
const path = require("path");

exports.submitAdmission = async (req, res) => {

try {

const admission = new Admission(req.body);

await admission.save();

await appendToExcel(req.body);

res.status(200).json({
success: true,
message: "Form submitted successfully"
});

} catch (error) {

console.error(error);

res.status(500).json({
error: "Failed to submit application",
details: error.message
});
}
};

exports.downloadExcel = async (req, res) => {

const filePath = path.join(__dirname, "../excel/admissions.xlsx");

res.download(filePath);

};