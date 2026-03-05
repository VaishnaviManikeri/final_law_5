const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const auth = require('../middleware/auth');

// ================= ADMIN ROUTES =================
router.get('/admin/all', auth, careerController.getAllCareersAdmin);

// ================= PUBLIC ROUTES =================
router.get('/', careerController.getAllCareers);
router.get('/:id', careerController.getCareerById);

// ================= PROTECTED ROUTES =================
router.post('/', auth, careerController.createCareer);
router.put('/:id', auth, careerController.updateCareer);
router.delete('/:id', auth, careerController.deleteCareer);

module.exports = router;