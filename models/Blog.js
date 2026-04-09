const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
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
    metaTitle: {
      type: String,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      maxlength: 160,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create index for slug
blogSchema.index({ slug: 1 });

module.exports = mongoose.model('Blog', blogSchema);
