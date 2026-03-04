const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../excel/admissions.xlsx");

async function appendToExcel(data) {

let workbook;

if (fs.existsSync(filePath)) {

workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(filePath);

} else {

workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet("Admissions");

sheet.columns = [
{ header: "First Name", key: "firstName" },
{ header: "Last Name", key: "lastName" },
{ header: "Email", key: "email" },
{ header: "Phone", key: "phone" },
{ header: "Course", key: "course" },
{ header: "Year", key: "year" },
{ header: "10th %", key: "tenthPercentage" },
{ header: "12th %", key: "twelfthPercentage" },
{ header: "Stream", key: "twelfthStream" },
{ header: "Board", key: "board" },
{ header: "Category", key: "category" },
{ header: "City", key: "city" },
{ header: "State", key: "state" },
{ header: "Phone", key: "phone" },
{ header: "Guardian", key: "guardianName" },
{ header: "Guardian Phone", key: "guardianPhone" },
{ header: "Created", key: "createdAt" }
];

await workbook.xlsx.writeFile(filePath);

}

const worksheet = workbook.getWorksheet("Admissions");

worksheet.addRow({
...data,
createdAt: new Date()
});

await workbook.xlsx.writeFile(filePath);

}

module.exports = appendToExcel;