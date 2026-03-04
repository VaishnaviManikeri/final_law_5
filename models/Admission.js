const mongoose = require("mongoose");

const AdmissionSchema = new mongoose.Schema(
{
firstName: String,
lastName: String,
email: String,
phone: String,
course: String,
year: String,
message: String,

address: String,
city: String,
state: String,
pincode: String,

tenthPercentage: Number,
twelfthPercentage: Number,
twelfthStream: String,
board: String,

category: String,
dateOfBirth: Date,
gender: String,

guardianName: String,
guardianPhone: String,
howDidYouHear: String,

formType: String

},
{ timestamps: true }
);

module.exports = mongoose.model("Admission", AdmissionSchema);