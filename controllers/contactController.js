const nodemailer = require("nodemailer");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify SMTP (DEBUG + SAFETY)
    await transporter.verify();

    // Mail to You
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Enquiry",
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    // Auto Reply to User
    await transporter.sendMail({
      from: `"Jadhavar Law College" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for reaching toward us",
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for contacting us. We will reach you shortly.</p>
        <br/>
        <p>Regards,<br/>Jadhavar Law College</p>
      `,
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).json({ error: "Email sending failed" });
  }
};
