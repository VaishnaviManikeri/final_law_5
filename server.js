const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// ================= LOAD ENV VARIABLES =================
dotenv.config();

// ================= CONNECT DATABASE =================
connectDB();

const app = express();

// ================= CORS CONFIG =================
const corsOptions = {
  origin: [
    'http://localhost:3000',   // React default
    'http://localhost:5173',   // Vite React
    'http://127.0.0.1:5173',
    'https://www.shardulraojadhavarcollegeoflaw.com',
    'https://final-law-5.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Enable CORS
app.use(cors(corsOptions));

// ================= MIDDLEWARE =================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ================= STATIC FILES =================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= ROOT TEST =================
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running successfully 🚀',
    endpoints: {
      admissions: '/api/admissions',
      test: '/api/test',
      admin: '/api/admin',
      gallery: '/api/gallery',
      announcements: '/api/announcements',
      careers: '/api/careers',
      blogs: '/api/blogs',
      contact: '/api/contact'
    }
  });
});

// ================= HEALTH CHECK =================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ================= ROUTES =================
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admissions', require('./routes/admissionRoutes'));

// ================= 404 HANDLER =================
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Admissions endpoint: http://localhost:${PORT}/api/admissions`);
});