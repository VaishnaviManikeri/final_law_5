const Video = require('../models/Video');
const cloudinary = require('../config/cloudinary');

const DEFAULT_THUMBNAIL = '/assets/images/video22.jpg';

const cloudinaryVideoThumbnail = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes('/video/upload/')) return null;
  return videoUrl
    .replace('/video/upload/', '/video/upload/so_1,f_jpg/')
    .replace(/\.[a-z0-9]+(?=([?#]|$))/i, '.jpg');
};

const youtubeThumbnail = (videoUrl) => {
  try {
    const url = new URL(videoUrl);
    let id = null;
    if (url.hostname.includes('youtu.be')) id = url.pathname.split('/').filter(Boolean)[0];
    if (url.hostname.includes('youtube.com')) {
      id = url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
    }
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
};

const thumbnailFor = (sourceType, videoUrl) =>
  cloudinaryVideoThumbnail(videoUrl) ||
  (sourceType === 'link' ? youtubeThumbnail(videoUrl) : null) ||
  DEFAULT_THUMBNAIL;

const serializeVideo = (video) => {
  const data = video.toObject ? video.toObject() : video;
  return { ...data, thumbnail: thumbnailFor(data.sourceType, data.videoUrl) };
};

const isWebUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json({ success: true, data: videos.map(serializeVideo) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllVideosAdmin = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: videos.map(serializeVideo) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    return res.json({ success: true, data: serializeVideo(video) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const { title, description = '', sourceType, videoLink, isActive = true } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!['upload', 'link'].includes(sourceType)) {
      return res.status(400).json({ error: 'Choose upload or link as the video source' });
    }
    if (sourceType === 'upload' && !req.file) {
      return res.status(400).json({ error: 'A video file is required' });
    }
    if (sourceType === 'link' && !isWebUrl(videoLink)) {
      return res.status(400).json({ error: 'Enter a valid http(s) video link' });
    }

    const video = await Video.create({
      title: title.trim(),
      description: description.trim(),
      sourceType,
      videoUrl: sourceType === 'upload' ? req.file.path : videoLink.trim(),
      cloudinaryPublicId: sourceType === 'upload' ? req.file.filename : null,
      thumbnail: thumbnailFor(
        sourceType,
        sourceType === 'upload' ? req.file.path : videoLink.trim()
      ),
      isActive: String(isActive) !== 'false',
    });
    return res.status(201).json({ success: true, data: serializeVideo(video) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const nextType = req.body.sourceType || video.sourceType;
    if (!['upload', 'link'].includes(nextType)) {
      return res.status(400).json({ error: 'Invalid video source' });
    }
    if (nextType === 'link' && req.body.videoLink && !isWebUrl(req.body.videoLink)) {
      return res.status(400).json({ error: 'Enter a valid http(s) video link' });
    }
    if (nextType === 'upload' && video.sourceType !== 'upload' && !req.file) {
      return res.status(400).json({ error: 'Choose a video file when changing to upload' });
    }

    const oldPublicId = video.cloudinaryPublicId;
    if (req.body.title !== undefined) video.title = req.body.title.trim();
    if (req.body.description !== undefined) video.description = req.body.description.trim();
    if (req.body.isActive !== undefined) video.isActive = String(req.body.isActive) === 'true';

    if (req.file) {
      video.sourceType = 'upload';
      video.videoUrl = req.file.path;
      video.cloudinaryPublicId = req.file.filename;
    } else if (nextType === 'link' && req.body.videoLink) {
      video.sourceType = 'link';
      video.videoUrl = req.body.videoLink.trim();
      video.cloudinaryPublicId = null;
    }

    video.thumbnail = thumbnailFor(video.sourceType, video.videoUrl);

    await video.save();
    if (oldPublicId && oldPublicId !== video.cloudinaryPublicId) {
      cloudinary.uploader.destroy(oldPublicId, { resource_type: 'video' }).catch(console.error);
    }
    return res.json({ success: true, data: serializeVideo(video) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    if (video.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' });
    }
    return res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
