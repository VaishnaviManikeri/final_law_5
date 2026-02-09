const express = require('express');
const router = express.Router();
const {
  submitContactForm,
  getAllContacts,
  getContactById,
  deleteContact
} = require('../controllers/contactController');

// If you have auth middleware, use it like this:
// const { protect, admin } = require('../middleware/authMiddleware');

// For now, let's create simple middleware functions
const protect = (req, res, next) => {
  // This is a placeholder - in production, implement proper JWT auth
  console.log('Auth check - placeholder');
  next();
};

const admin = (req, res, next) => {
  // This is a placeholder - in production, check admin role
  console.log('Admin check - placeholder');
  next();
};

// Public routes
router.post('/', submitContactForm);

// Admin routes (protected)
router.get('/admin', protect, admin, getAllContacts);
router.get('/admin/:id', protect, admin, getContactById);
router.delete('/admin/:id', protect, admin, deleteContact);

module.exports = router;