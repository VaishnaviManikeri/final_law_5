const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* =====================================================
   ENSURE uploads/blogs FOLDER EXISTS (IMPORTANT)
   ===================================================== */
const uploadPath = path.join(__dirname, '../uploads/blogs');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* =====================================================
   MULTER STORAGE CONFIG
   ===================================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      'blog-' + Date.now() + path.extname(file.originalname)
    );
  },
});

/* =====================================================
   FILE FILTER
   ===================================================== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed'), false);
  }
};

/* =====================================================
   EXPORT MULTER INSTANCE
   ===================================================== */
module.exports = multer({
  storage,
  fileFilter,
});
