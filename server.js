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
app.use('/api/careers', require('./routes/careerRoutes')); // NEW
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admission', require('./routes/admissionRoutes')); // NEW ADMISSION ROUTE

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message,
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
