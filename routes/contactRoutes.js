const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// POST CONTACT FORM
router.post("/", async (req, res) => {
  try {
    const { name, email, mobile, course, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail to College
    await transporter.sendMail({
      from: email,
      to: "vaishnavimanikeri@gmail.com",
      subject: "New 5 Years Law Course Enquiry",
      html: `
        <h2>New Enquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Mobile:</b> ${mobile}</p>
        <p><b>Course:</b> ${course}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    // Auto Reply to Student
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting Jadhavar Law College",
      html: `
        <h3>Thank you for reaching towards us</h3>
        <p>Dear ${name},</p>

        <p>We have received your enquiry for <b>${course}</b>.</p>

        <p>Our admission team will contact you shortly.</p>

        <br/>

        <p>Regards,<br/>
        Jadhavar Law College</p>
      `,
    });

    res.json({ success: true, message: "Enquiry sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Email sending failed" });
  }
});

module.exports = router;
