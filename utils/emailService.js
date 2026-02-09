const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send contact form submission email
 */
const sendContactEmail = async (contactData) => {
  try {
    const { name, email, phone, subject, message } = contactData;
    
    // Check if email configuration exists
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration missing. Skipping email notification.');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Contact Details:</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%; background-color: #f2f2f2;">Name:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f2f2f2;">Email:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <a href="mailto:${email}" style="color: #4CAF50; text-decoration: none;">
                    ${email}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f2f2f2;">Phone:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f2f2f2;">Subject:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f2f2f2; vertical-align: top;">Message:</td>
                <td style="padding: 10px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f2f2f2;">Time:</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            This email was automatically generated from your website contact form.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending contact email:', error.message);
    // Don't throw error to prevent breaking the contact submission
    return false;
  }
};

/**
 * Send auto-reply to user
 */
const sendAutoReply = async (contactData) => {
  try {
    const { name, email } = contactData;
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email configuration missing. Skipping auto-reply.');
      return false;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank You for Contacting Us',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            Thank You for Contacting Us!
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>Dear <strong>${name}</strong>,</p>
            
            <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
            
            <p>Our team typically responds within 24-48 hours during business days.</p>
            
            <div style="background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <p style="margin: 0;"><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0;">
                <li>Our team will review your inquiry</li>
                <li>We'll contact you using the information you provided</li>
                <li>We'll do our best to address your concerns promptly</li>
              </ul>
            </div>
            
            <p>Best regards,<br>Your Company Team</p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Auto-reply email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending auto-reply:', error.message);
    return false;
  }
};

module.exports = {
  sendContactEmail,
  sendAutoReply
};