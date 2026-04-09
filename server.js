const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// ================= LOAD ENV VARIABLES =================
dotenv.config();

// ================= CONNECT DATABASE =================
connectDB();

const app = express();

// ================= ENSURE UPLOADS DIRECTORY EXISTS =================
const uploadsDir = path.join(__dirname, 'uploads');
const blogsUploadsDir = path.join(__dirname, 'uploads/blogs');
const galleryUploadsDir = path.join(__dirname, 'uploads/gallery');

// Create uploads directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}
if (!fs.existsSync(blogsUploadsDir)) {
  fs.mkdirSync(blogsUploadsDir, { recursive: true });
  console.log('📁 Created blogs uploads directory');
}
if (!fs.existsSync(galleryUploadsDir)) {
  fs.mkdirSync(galleryUploadsDir, { recursive: true });
  console.log('📁 Created gallery uploads directory');
}

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://shardulraojadhavarcollegeoflaw.com',
      'https://shardulraojadhavarcollegeoflaw.com/'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILES =================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= ROOT TEST =================
app.get('/', (req, res) => {
  res.send('Backend is running successfully 🚀');
});

// ================= ✅ PING ROUTE =================
app.get('/ping', (req, res) => {
  res.send('✅ Server is alive');
});

// ================= ROUTES =================
app.use('/api/test', require('./routes/testRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/careers', require('./routes/careerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admission', require('./routes/admissionRoutes'));

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message,
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`✅ Blog routes: /api/blogs`);
  console.log(`✅ Gallery routes: /api/gallery`);
  console.log(`✅ Admission routes: /api/admission`);
});
