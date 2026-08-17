const express = require('express');
const auth = require('../middleware/auth');
const uploadVideo = require('../middleware/uploadVideo');
const controller = require('../controllers/videoController');

const router = express.Router();

router.get('/', controller.getAllVideos);
router.get('/admin/all', auth, controller.getAllVideosAdmin);
router.get('/:id', controller.getVideoById);
router.post('/', auth, uploadVideo.single('video'), controller.createVideo);
router.put('/:id', auth, uploadVideo.single('video'), controller.updateVideo);
router.delete('/:id', auth, controller.deleteVideo);

module.exports = router;
