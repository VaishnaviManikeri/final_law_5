const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', announcementController.getAllAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);

// Protected routes
router.post('/', auth, announcementController.createAnnouncement);
router.put('/:id', auth, announcementController.updateAnnouncement);
router.delete('/:id', auth, announcementController.deleteAnnouncement);
router.get('/admin/all', auth, announcementController.getAllAnnouncementsAdmin);

module.exports = router;