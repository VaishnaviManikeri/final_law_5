const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', careerController.getAllCareers);
router.get('/:id', careerController.getCareerById);

// Debug route (no auth required for debugging)
router.get('/debug/all', careerController.debugCareers);

// Protected routes (require authentication)
router.post('/', auth, careerController.createCareer);
router.put('/:id', auth, careerController.updateCareer);
router.delete('/:id', auth, careerController.deleteCareer);
router.get('/admin/all', auth, careerController.getAllCareersAdmin);

module.exports = router;