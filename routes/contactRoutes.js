const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail to Admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "vaishnavimanikeri@gmail.com",
      subject: "New Contact Form Submission",
      html: `
        <h3>New Contact</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    // Auto Reply to User
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank You for Contacting Us",
      html: `
        <h2>Dear ${name},</h2>
        <p>Thank you for reaching toward us.</p>
        <p>We have received your message and will contact you shortly.</p>

        <br/>

        <b>Jadhavar Law College</b>
      `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Mail sending failed" });
  }
});

module.exports = router;
