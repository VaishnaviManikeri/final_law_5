const express = require('express');
const Blog = require('../models/Blog');
const upload = require('../middleware/uploadBlog');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper function to calculate reading time
function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/* =====================================================
   ADMIN ROUTES
   ===================================================== */

// GET ALL BLOGS (ADMIN)
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// DELETE BLOG (ADMIN ONLY)
router.delete('/admin/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.coverImage) {
      const imagePath = path.join(__dirname, '..', blog.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

/* =====================================================
   PUBLIC ROUTES
   ===================================================== */

// GET ALL PUBLISHED BLOGS
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).sort({
      createdAt: -1,
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// GET SINGLE BLOG BY ID OR SLUG
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let blog;

    // Check if identifier is a valid ObjectId or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(identifier);
    } else {
      blog = await Blog.findOne({ slug: identifier, status: 'published' });
    }

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

/* =====================================================
   CREATE BLOG
   ===================================================== */

router.post('/', upload.single('coverImage'), async (req, res) => {
  try {
    let slug = req.body.slug;
    if (!slug && req.body.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    const readingTime = calculateReadingTime(req.body.content);

    const blog = await Blog.create({
      title: req.body.title,
      slug: slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      status: req.body.status || 'published',
      coverImage: req.file ? `/uploads/blogs/${req.file.filename}` : null,
      metaTitle: req.body.metaTitle || req.body.title,
      metaDescription: req.body.metaDescription || req.body.excerpt,
      readingTime: readingTime,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

/* =====================================================
   UPDATE BLOG
   ===================================================== */

router.put('/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      status: req.body.status,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    };

    if (req.body.slug) {
      updateData.slug = req.body.slug;
    }

    if (req.file) {
      updateData.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    if (req.body.content) {
      updateData.readingTime = calculateReadingTime(req.body.content);
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

module.exports = router;
