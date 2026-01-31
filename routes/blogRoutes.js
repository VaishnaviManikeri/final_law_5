const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();

/* ================= PUBLIC ================= */

// Get all published blogs
router.get('/', async (req, res) => {
  const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
  res.json(blogs);
});

// Get single blog
router.get('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ error: 'Blog not found' });
  res.json(blog);
});

/* ================= ADMIN ================= */

// Admin: all blogs
router.get('/admin/all', async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

// Create blog
router.post('/', async (req, res) => {
  const blog = await Blog.create(req.body);
  res.status(201).json(blog);
});

// Update blog
router.put('/:id', async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(blog);
});

// Delete blog
router.delete('/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Blog deleted' });
});

module.exports = router;
