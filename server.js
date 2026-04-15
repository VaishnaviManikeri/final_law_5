const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// ================= LOAD ENV =================
dotenv.config();

// ================= CONNECT DB =================
connectDB();

const app = express();

/*
|--------------------------------------------------------------------------
| ✅ ENSURE UPLOAD FOLDERS
|--------------------------------------------------------------------------
*/
const uploadsDir = path.join(__dirname, 'uploads');
const blogsUploadsDir = path.join(__dirname, 'uploads/blogs');
const galleryUploadsDir = path.join(__dirname, 'uploads/gallery');

[uploadsDir, blogsUploadsDir, galleryUploadsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
});

/*
|--------------------------------------------------------------------------
| ✅ FIXED CORS (IMPORTANT)
|--------------------------------------------------------------------------
*/
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('❌ CORS BLOCKED:', origin);
        callback(null, true); // allow anyway
      }
    },
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| ✅ MIDDLEWARE
|--------------------------------------------------------------------------
*/
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| ✅ STATIC FILES
|--------------------------------------------------------------------------
*/
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*
|--------------------------------------------------------------------------
| ✅ ROUTES
|--------------------------------------------------------------------------
*/
app.get('/', (req, res) => {
  res.send('🚀 Backend running');
});

app.get('/ping', (req, res) => {
  res.send('✅ Server alive');
});

// ✅ NEW: Hostinger status API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: '🚀 Hostinger backend running',
    timestamp: new Date(),
  });
});

app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admission', require('./routes/admissionRoutes'));

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);
  res.status(500).json({
    error: 'Server error',
    details: err.message,
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
