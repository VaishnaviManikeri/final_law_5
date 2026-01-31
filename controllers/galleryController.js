const Gallery = require('../models/Gallery');

/* =========================
   CREATE GALLERY ITEM
========================= */
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // ✅ Cloudinary secure URL
    const image = req.file ? req.file.path : null;

    const galleryItem = new Gallery({
      title,
      description,
      category,
      image,           // ✅ store full Cloudinary URL
      isActive: true,
    });

    await galleryItem.save();

    return res.status(201).json({
      success: true,
      data: galleryItem,
    });
  } catch (error) {
    console.error('Create Gallery Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   GET ALL ACTIVE (PUBLIC)
========================= */
exports.getAllGalleryItems = async (req, res) => {
  try {
    const items = await Gallery.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   GET GALLERY ITEM BY ID
========================= */
exports.getGalleryItemById = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   UPDATE GALLERY ITEM
========================= */
exports.updateGalleryItem = async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      updatedAt: Date.now(),
    };

    // ✅ Replace image only if new file uploaded
    if (req.file) {
      updates.image = req.file.path;
    }

    const item = await Gallery.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    return res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   DELETE GALLERY ITEM (SOFT)
========================= */
exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    return res.json({
      success: true,
      message: 'Gallery item deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   ADMIN: GET ALL ITEMS
========================= */
exports.getAllGalleryItemsAdmin = async (req, res) => {
  try {
    const items = await Gallery.find().sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
