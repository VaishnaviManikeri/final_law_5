const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send contact notification to admin
exports.sendContactNotification = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'vaishnavimanikeri@gmail.com',
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Contact Form Submission</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #3498db; margin-top: 10px;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 20px; color: #7f8c8d; font-size: 12px;">
              Received at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending contact notification:', error);
    throw error;
  }
};

// Send auto-reply to user
exports.sendAutoReply = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Law Firm" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Thank You for Contacting Us',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0; background-color: #2c3e50; color: white;">
            <h1 style="margin: 0;">Thank You, ${userName}!</h1>
          </div>
          
          <div style="padding: 30px;">
            <p>Dear <strong>${userName}</strong>,</p>
            
            <p>Thank you for contacting our law firm. We have received your message and appreciate you reaching out to us.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">What Happens Next:</h3>
              <ul>
                <li>Our team will review your message within 24 hours</li>
                <li>We will respond to your inquiry at the earliest</li>
                <li>For urgent matters, please call our office directly</li>
              </ul>
            </div>
            
            <p><strong>Office Hours:</strong><br>
            Monday - Friday: 9:00 AM - 6:00 PM<br>
            Saturday: 10:00 AM - 2:00 PM</p>
            
            <p><strong>Contact Information:</strong><br>
            📧 Email: vaishnavimanikeri@gmail.com<br>
            📞 Phone: +91 1234567890<br>
            🏢 Address: [Your Office Address]</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #7f8c8d; font-size: 12px;">
                This is an automated response. Please do not reply to this email.
              </p>
              <p style="color: #7f8c8d; font-size: 12px;">
                © ${new Date().getFullYear()} Law Firm. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Auto-reply email sent to:', userEmail);
    return info;
  } catch (error) {
    console.error('Error sending auto-reply:', error);
    throw error;
  }
};