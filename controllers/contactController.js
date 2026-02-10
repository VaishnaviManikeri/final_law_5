const axios = require("axios");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Mail to YOU
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Website Contact",
          email: "vaishnavimanikeri@gmail.com",
        },
        to: [
          {
            email: "vaishnavimanikeri@gmail.com",
            name: "Vaishnavi",
          },
        ],
        subject: "New Contact Enquiry",
        htmlContent: `
          <b>Name:</b> ${name}<br/>
          <b>Email:</b> ${email}<br/>
          <b>Phone:</b> ${phone}<br/>
          <b>Message:</b> ${message}
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Auto-reply to USER
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Jadhavar Law College",
          email: "vaishnavimanikeri@gmail.com",
        },
        to: [
          {
            email: email,
            name: name,
          },
        ],
        subject: "Thank you for reaching toward us",
        htmlContent: `
          Hello ${name},<br/><br/>
          Thank you for contacting us.<br/>
          We will get back to you shortly.<br/><br/>
          Regards,<br/>
          Jadhavar Law College
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true });

  } catch (error) {
    console.error("BREVO API ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Email failed" });
  }
};
