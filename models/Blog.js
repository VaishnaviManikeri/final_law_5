const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    required: true,
    default: 'Admin'
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  readingTime: {
    type: String,
    default: '5 min read'
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate slug from title before saving - FIXED
blogSchema.pre('save', function(next) {
  try {
    // Only generate slug if title is modified and slug is empty
    if (this.isModified('title') && (!this.slug || this.slug === '')) {
      this.slug = this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Blog', blogSchema);
