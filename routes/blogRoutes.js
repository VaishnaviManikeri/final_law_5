const express = require('express');
const Blog = require('../models/Blog');
const upload = require('../middleware/uploadBlog');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/* =====================================================
   ADMIN ROUTES (KEEP THESE FIRST)
   ===================================================== */

// ✅ GET ALL BLOGS (ADMIN)
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// ✅ DELETE BLOG (ADMIN ONLY)
router.delete('/admin/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // delete image if exists
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

// ✅ UPDATE BLOG STATUS (ADMIN)
router.patch('/admin/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update blog status' });
  }
});

/* =====================================================
   PUBLIC ROUTES
   ===================================================== */

// ✅ GET ALL PUBLISHED BLOGS
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

// ✅ GET SINGLE BLOG
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
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
    const blog = await Blog.create({
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      status: req.body.status || 'published',
      coverImage: req.file
        ? `/uploads/blogs/${req.file.filename}`
        : null,
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
    };

    if (req.file) {
      // Delete old image if exists
      const oldBlog = await Blog.findById(req.params.id);
      if (oldBlog && oldBlog.coverImage) {
        const oldImagePath = path.join(__dirname, '..', oldBlog.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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
