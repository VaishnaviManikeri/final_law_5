const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    sourceType: { type: String, enum: ['upload', 'link'], required: true },
    videoUrl: { type: String, required: true, trim: true },
    cloudinaryPublicId: { type: String, default: null },
    thumbnail: { type: String, default: '/assets/images/video22.jpg' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
