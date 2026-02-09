const nodemailer = require("nodemailer");

exports.sendContact = async (req, res) => {

  try {

    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"College Website" <${process.env.MAIL_USER}>`,
      to: "vaishnavimanikeri@gmail.com",
      subject: "New Contact Form Submission",
      html: `
        <h2>New Inquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Mail failed" });
  }
};
