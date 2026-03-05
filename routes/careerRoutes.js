const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', careerController.getAllCareers);
router.get('/:id', careerController.getCareerById);

// Protected routes (require authentication)
router.post('/', auth, careerController.createCareer);
router.put('/:id', auth, careerController.updateCareer);
router.delete('/:id', auth, careerController.deleteCareer);
router.get('/admin/all', auth, careerController.getAllCareersAdmin);

module.exports = router;