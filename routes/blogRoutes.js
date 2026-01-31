const express = require('express');
const Blog = require('../models/Blog');
const upload = require('../middleware/uploadBlog');

const router = express.Router();

/* ================= PUBLIC ================= */

// Get all published blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find({ status: 'published' }).sort({
    createdAt: -1,
  });
  res.json(blogs);
});

// Get single blog
router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
});

/* ================= ADMIN ================= */

// Get all blogs
router.get('/admin/all', async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

// Create blog
router.post('/', upload.single('coverImage'), async (req, res) => {
  const blog = await Blog.create({
    title: req.body.title,
    excerpt: req.body.excerpt,
    content: req.body.content,
    status: req.body.status,
    coverImage: req.file
      ? `/uploads/blogs/${req.file.filename}`
      : null,
  });

  res.status(201).json(blog);
});

// Update blog
router.put('/:id', upload.single('coverImage'), async (req, res) => {
  const updateData = {
    title: req.body.title,
    excerpt: req.body.excerpt,
    content: req.body.content,
    status: req.body.status,
  };

  if (req.file) {
    updateData.coverImage = `/uploads/blogs/${req.file.filename}`;
  }

  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  res.json(blog);
});

// Delete blog
router.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Blog deleted successfully' });
});

module.exports = router;
