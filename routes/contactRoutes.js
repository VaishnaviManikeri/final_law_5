const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactNotification, sendAutoReply } = require('../services/emailService');
const authMiddleware = require('../middleware/auth');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Name, email, subject, and message are required fields',
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address',
      });
    }

    // Create contact record
    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await contact.save();

    // Send emails (async - don't await for faster response)
    try {
      // Send notification to admin
      await sendContactNotification({
        name,
        email,
        phone: phone || '',
        subject,
        message,
      });

      // Send auto-reply to user
      await sendAutoReply(email, name);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if emails fail
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
      },
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to submit contact form. Please try again later.',
      details: error.message,
    });
  }
});

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact/admin/all
// @access  Private/Admin
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact submissions',
    });
  }
});

// @desc    Get single contact submission (Admin only)
// @route   GET /api/contact/admin/:id
// @access  Private/Admin
router.get('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).select('-__v');

    if (!contact) {
      return res.status(404).json({
        error: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact submission',
    });
  }
});

// @desc    Update contact status (Admin only)
// @route   PUT /api/contact/admin/:id/status
// @access  Private/Admin
router.put('/admin/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status value',
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!contact) {
      return res.status(404).json({
        error: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      error: 'Failed to update contact status',
    });
  }
});

// @desc    Delete contact submission (Admin only)
// @route   DELETE /api/contact/admin/:id
// @access  Private/Admin
router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      error: 'Failed to delete contact submission',
    });
  }
});

module.exports = router;