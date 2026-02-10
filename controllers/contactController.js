const nodemailer = require("nodemailer");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Admin Mail
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: "vaishnavimanikeri@gmail.com",
      subject: "New Contact Form Submission",
      html: `
        <h3>New Enquiry</h3>
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
        <h2>Hello ${name},</h2>
        <p>Thank you for contacting us.</p>
        <p>We received your message and will get back to you shortly.</p>
        <br/>
        <b>Regards,<br/>Jadhavar Law College</b>
      `,
    });

    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Email sending failed" });
  }
};
