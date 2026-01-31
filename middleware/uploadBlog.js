const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/blogs');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      'blog-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (extValid) cb(null, true);
  else cb(new Error('Only image files allowed'));
};

module.exports = multer({
  storage,
  fileFilter,
});
