import AppError from "../utilities/appError.js";
import { db } from "../../database/models/index.js";
import upload from "../../config/multer.js";
import cloudinary from "../../config/cloudinary.js";

const { Video, Channel, User } = db;

// POST /api/upload/video/:videoId
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { upload_url, processing_id }
export const uploadVideoService = async (user, videoId, file) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);
  if (video.processing_status === "completed")
    throw new AppError("Video already uploaded", 409);
  if (video.processing_status === "processing")
    throw new AppError("Video is being processed", 409);

  await video.update({
    processing_status: "processing",
  });

  let result;
  try {
    result = await cloudinary.uploader.upload(file.path, {
      resource_type: "video",
    });

    await video.update({
      processing_status: "completed",
      url: result.secure_url,
    });
  } catch (err) {
    await video.update({
      processing_status: "failed",
      processing_message: err.message,
    });
    throw err;
  }

  return {
    uploadUrl: result.secure_url,
  };
};

// POST /api/upload/image/:processId?type=avatar|banner|thumbnail
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { image_file, type: 'avatar'|'banner'|'thumbnail' }
// Response: { image_url }

// GET /api/upload/status/:videoId
// Headers: Authorization
// Response: { status, progress?, error?, video_url? }
