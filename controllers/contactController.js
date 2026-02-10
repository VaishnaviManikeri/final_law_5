const nodemailer = require("nodemailer");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 🔥 verify connection
    await transporter.verify();

    await transporter.sendMail({
      from: `"Website" <${process.env.SMTP_USER}>`,
      to: "vaishnavimanikeri@gmail.com",
      subject: "New Contact Enquiry",
      html: `
        <b>Name:</b> ${name}<br/>
        <b>Email:</b> ${email}<br/>
        <b>Phone:</b> ${phone}<br/>
        <b>Message:</b> ${message}
      `,
    });

    await transporter.sendMail({
      from: `"Jadhavar Law College" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Thank you for reaching toward us",
      html: `
        Hello ${name},<br/><br/>
        Thank you for contacting us. We will reply shortly.<br/><br/>
        Regards,<br/>
        Jadhavar Law College
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("SMTP ERROR:", err);
    res.status(500).json({ error: "Email failed" });
  }
};
