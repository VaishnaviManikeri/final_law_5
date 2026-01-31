const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// ================= PUBLIC ROUTES =================
router.get('/', galleryController.getAllGalleryItems);

// ================= ADMIN ROUTES (PROTECTED) =================
router.get('/admin/all', auth, galleryController.getAllGalleryItemsAdmin);

// ================= SINGLE ITEM ROUTES =================
router.get('/:id', galleryController.getGalleryItemById);

// ================= CRUD (PROTECTED) =================
router.post(
  '/',
  auth,
  upload.single('image'), // works with Cloudinary
  galleryController.createGalleryItem
);

router.put(
  '/:id',
  auth,
  upload.single('image'), // optional image update
  galleryController.updateGalleryItem
);

router.delete(
  '/:id',
  auth,
  galleryController.deleteGalleryItem
);

module.exports = router;
