const express = require('express');
const Blog = require('../models/Blog');
const upload = require('../middleware/uploadBlog');
const fs = require('fs');
const path = require('path');

const router = express.Router();

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

// GET SINGLE BLOG (by ID or slug)
router.get('/:id', async (req, res) => {
  try {
    let blog;
    
    // Check if it's a slug (no special characters) or ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(req.params.id);
    } else {
      blog = await Blog.findOne({ slug: req.params.id, status: 'published' });
    }
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Increment view count
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

/* =====================================================
   CREATE BLOG
   ===================================================== */

router.post('/', upload.single('coverImage'), async (req, res) => {
  try {
    const blogData = {
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      status: req.body.status || 'published',
      coverImage: req.file ? `/uploads/blogs/${req.file.filename}` : null,
      metaTitle: req.body.metaTitle || req.body.title,
      metaDescription: req.body.metaDescription || req.body.excerpt,
      slug: req.body.slug || null,
    };
    
    // Check if slug is unique
    if (blogData.slug) {
      const existingBlog = await Blog.findOne({ slug: blogData.slug });
      if (existingBlog) {
        blogData.slug = `${blogData.slug}-${Date.now()}`;
      }
    }
    
    const blog = await Blog.create(blogData);
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
      slug: req.body.slug || null,
    };

    if (req.file) {
      // Delete old image
      const oldBlog = await Blog.findById(req.params.id);
      if (oldBlog && oldBlog.coverImage) {
        const oldImagePath = path.join(__dirname, '..', oldBlog.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.coverImage = `/uploads/blogs/${req.file.filename}`;
    }

    // Check slug uniqueness
    if (updateData.slug) {
      const existingBlog = await Blog.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: req.params.id } 
      });
      if (existingBlog) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
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
