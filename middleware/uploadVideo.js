const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'videos',
    resource_type: 'video',
    public_id: `video-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

const uploadVideo = multer({
  storage,
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
      return callback(null, true);
    }
    return callback(new Error('Please select a valid video file'));
  },
});

module.exports = uploadVideo;
