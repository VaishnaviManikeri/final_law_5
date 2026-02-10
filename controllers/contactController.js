const nodemailer = require("nodemailer");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ADMIN MAIL
    await transporter.sendMail({
      from: "vaishnavimanikeri@gmail.com",
      to: "vaishnavimanikeri@gmail.com",
      subject: "New Contact Enquiry",
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}
      `,
    });

    // USER AUTO REPLY
    await transporter.sendMail({
      from: "vaishnavimanikeri@gmail.com",
      to: email,
      subject: "Thank you for reaching toward us",
      text: `Hello ${name},

Thank you for contacting us.
We will reach you shortly.

Jadhavar Law College`,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("SMTP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
