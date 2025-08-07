import * as uploadServer from "../services/uploade.js";

// POST /api/upload/video
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { upload_url, processing_id }
export const uploadVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const file = req.file;
  const data = await uploadServer.uploadVideoService(user, videoId, file);
  res.jsend.success(data);
};

// POST /api/upload/image
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { image_file, type: 'avatar'|'banner'|'thumbnail' }
// Response: { image_url }

// GET /api/upload/status/:processingId
// Headers: Authorization
// Response: { status, progress?, error?, video_url? }
