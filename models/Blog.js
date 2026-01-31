const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: 'Admin',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    coverImage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
