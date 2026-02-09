const Contact = require('../models/Contact');
const { sendContactEmail, sendAutoReply } = require('../utils/emailService');

/**
 * Submit contact form
 */
const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create and save contact
    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message
    });

    const savedContact = await contact.save();

    // Send emails (don't await to not block response)
    sendContactEmail(savedContact).catch(err => 
      console.error('Failed to send notification:', err.message)
    );
    
    sendAutoReply(savedContact).catch(err => 
      console.error('Failed to send auto-reply:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: savedContact._id,
        name: savedContact.name,
        email: savedContact.email,
        submittedAt: savedContact.submittedAt
      }
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry found'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * Get all contacts (Admin)
 */
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ submittedAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get single contact (Admin)
 */
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete contact (Admin)
 */
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    await contact.deleteOne();
    
    return res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  submitContactForm,
  getAllContacts,
  getContactById,
  deleteContact
};