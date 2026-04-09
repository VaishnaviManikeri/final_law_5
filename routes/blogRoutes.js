const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/blogs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .select('title slug author content featuredImage readingTime publishedAt views');
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    // Increment views
    blog.views += 1;
    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all blogs for admin
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single blog by ID for admin
router.get('/admin/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// CREATE blog - FIXED
router.post('/', upload.single('featuredImage'), async (req, res) => {
  try {
    console.log('=== CREATE BLOG REQUEST ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Has file:', !!req.file);
    if (req.file) {
      console.log('File details:', {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size
      });
    }
    
    let blogData;
    
    // Check if data is coming as JSON string or as form fields
    if (req.body.data) {
      // Data is stringified JSON
      try {
        blogData = JSON.parse(req.body.data);
        console.log('Parsed from data field:', blogData);
      } catch (parseError) {
        console.error('Error parsing blog data:', parseError);
        return res.status(400).json({ error: 'Invalid blog data format: ' + parseError.message });
      }
    } else {
      // Data is sent as individual form fields
      blogData = {
        title: req.body.title,
        slug: req.body.slug,
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        author: req.body.author,
        content: req.body.content,
        readingTime: req.body.readingTime,
        status: req.body.status
      };
      console.log('Parsed from individual fields:', blogData);
    }
    
    // Validate required fields
    if (!blogData.title || !blogData.title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!blogData.author || !blogData.author.trim()) {
      return res.status(400).json({ error: 'Author is required' });
    }
    
    if (!blogData.content || blogData.content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Generate slug if not provided
    if (!blogData.slug || blogData.slug.trim() === '') {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    // Check if slug already exists and make it unique if needed
    let existingBlog = await Blog.findOne({ slug: blogData.slug });
    if (existingBlog) {
      blogData.slug = blogData.slug + '-' + Date.now();
      console.log('Slug already exists, new slug:', blogData.slug);
    }
    
    // Add featured image if uploaded
    if (req.file) {
      blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }
    
    // Set default reading time if not provided
    if (!blogData.readingTime) {
      blogData.readingTime = '5 min read';
    }
    
    // Set default status if not provided
    if (!blogData.status) {
      blogData.status = 'published';
    }
    
    // Create and save blog
    const blog = new Blog(blogData);
    const savedBlog = await blog.save();
    console.log('Blog created successfully:', savedBlog._id);
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE blog
router.put('/:id', upload.single('featuredImage'), async (req, res) => {
  try {
    console.log('=== UPDATE BLOG REQUEST ===');
    console.log('Blog ID:', req.params.id);
    
    let blogData;
    
    // Check if data is coming as JSON string or as form fields
    if (req.body.data) {
      try {
        blogData = JSON.parse(req.body.data);
        console.log('Parsed from data field:', blogData);
      } catch (parseError) {
        console.error('Error parsing blog data:', parseError);
        return res.status(400).json({ error: 'Invalid blog data format' });
      }
    } else {
      blogData = {
        title: req.body.title,
        slug: req.body.slug,
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        author: req.body.author,
        content: req.body.content,
        readingTime: req.body.readingTime,
        status: req.body.status
      };
      console.log('Parsed from individual fields:', blogData);
    }
    
    if (req.file) {
      // Delete old image if exists
      const oldBlog = await Blog.findById(req.params.id);
      if (oldBlog && oldBlog.featuredImage) {
        const oldImagePath = path.join(__dirname, '..', oldBlog.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Deleted old image:', oldImagePath);
        }
      }
      blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }
    
    const blog = await Blog.findByIdAndUpdate(req.params.id, blogData, { 
      new: true,
      runValidators: true 
    });
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    console.log('Blog updated successfully:', blog._id);
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    // Delete featured image if exists
    if (blog.featuredImage) {
      const imagePath = path.join(__dirname, '..', blog.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image:', imagePath);
      }
    }
    
    await blog.deleteOne();
    console.log('Blog deleted successfully:', blog._id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
