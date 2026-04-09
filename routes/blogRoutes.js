const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/*
|--------------------------------------------------------------------------
| MULTER CONFIG (IMAGE UPLOAD)
|--------------------------------------------------------------------------
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/blogs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created blogs upload folder');
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);

    if (ext && mime) cb(null, true);
    else cb(new Error('Only images allowed'));
  },
});

/*
|--------------------------------------------------------------------------
| ✅ ADMIN ROUTES (MUST COME FIRST)
|--------------------------------------------------------------------------
*/

// GET ALL BLOGS (ADMIN)
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET BLOG BY ID (ADMIN)
router.get('/admin/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Fetch by ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| CREATE BLOG
|--------------------------------------------------------------------------
*/
router.post('/', upload.single('featuredImage'), async (req, res) => {
  try {
    console.log('=== CREATE BLOG ===');

    let blogData;

    // If JSON string
    if (req.body.data) {
      blogData = JSON.parse(req.body.data);
    } else {
      blogData = req.body;
    }

    // VALIDATION
    if (!blogData.title || !blogData.author || !blogData.content) {
      return res.status(400).json({
        error: 'Title, Author and Content are required',
      });
    }

    // SLUG GENERATE
    if (!blogData.slug) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // UNIQUE SLUG
    const exists = await Blog.findOne({ slug: blogData.slug });
    if (exists) {
      blogData.slug += '-' + Date.now();
    }

    // IMAGE
    if (req.file) {
      blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }

    // DEFAULTS
    blogData.readingTime = blogData.readingTime || '5 min read';
    blogData.status = blogData.status || 'published';

    const blog = new Blog(blogData);
    const saved = await blog.save();

    console.log('✅ Blog created:', saved._id);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE BLOG
|--------------------------------------------------------------------------
*/
router.put('/:id', upload.single('featuredImage'), async (req, res) => {
  try {
    let blogData;

    if (req.body.data) {
      blogData = JSON.parse(req.body.data);
    } else {
      blogData = req.body;
    }

    // HANDLE IMAGE UPDATE
    if (req.file) {
      const old = await Blog.findById(req.params.id);

      if (old && old.featuredImage) {
        const oldPath = path.join(__dirname, '..', old.featuredImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      blogData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    console.log('✅ Blog updated:', updated._id);
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE BLOG
|--------------------------------------------------------------------------
*/
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // DELETE IMAGE
    if (blog.featuredImage) {
      const imgPath = path.join(__dirname, '..', blog.featuredImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await blog.deleteOne();

    console.log('🗑 Blog deleted:', blog._id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// GET ALL PUBLISHED BLOGS
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error('Fetch blogs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ❗ IMPORTANT: KEEP THIS LAST
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error('Fetch slug error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
