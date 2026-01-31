const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // ✅ Cloudinary image URL
    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // handles createdAt & updatedAt
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);
