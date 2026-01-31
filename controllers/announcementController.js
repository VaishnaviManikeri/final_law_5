const Announcement = require('../models/Announcement');

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    
    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all announcements (admin)
exports.getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};