import fs from "fs/promises";

import AppError from "../utilities/appError.js";
import { db } from "../../database/models/index.js";
import cloudinary from "../../config/cloudinary.js";

const { Video, Channel, User } = db;

// POST /api/upload/video/:videoId
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { upload_url, processing_id }
export const uploadVideoService = async (user, videoId, file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) throw new AppError("File too large");

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
      folder: "flixly/videos",
      quality: "auto",
      fetch_format: "auto",
      use_filename: true,
      unique_filename: false,
      allowed_formats: ["mp4", "mov", "avi", "mkv", "webm"],
      timeout: 6000000, // 10 minutes
      eager: [
        { width: 1280, height: 720, crop: "limit", quality: "auto" },
        { width: 640, height: 360, crop: "limit", quality: "auto" },
      ],
      eager_async: true,
    });

    await video.update({
      processing_status: "completed",
      processing_message: "Upload completed successfully",
      url: result.secure_url,
      duration: result.duration,
    });
  } catch (err) {
    await video.update({
      processing_status: "failed",
      processing_message: err.message,
    });
    throw err;
  }

  await fs.unlink(file.path);

  return {
    uploadUrl: result.secure_url,
  };
};

// POST /api/upload/image/:processId?type=userAvatar|channelAvatar|channelBanner|thumbnail
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { image_file, type: 'avatar'|'banner'|'thumbnail' }
// Response: { image_url }
export const uploadImageService = async (user, processId, file, type) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) throw new AppError("File too large");

  let result;
  try {
    result = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
      folder: `flixly/images/${type}`,
      quality: "auto",
      fetch_format: "auto",
      use_filename: true,
      unique_filename: false,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      timeout: 6000000, // 10 minutes
      overwrite: true,
      invalidate: true,
    });
  } catch (err) {
    throw err;
  }

  if (type === "userAvatar") {
    if (user.id !== processId) throw new AppError("User not found", 404);
    await user.update({
      avatar: result.secure_url,
    });
  } else if (type === "channelAvatar") {
    const channel = await user.getChannel();
    if (channel.id !== processId) throw new AppError("Channel not found", 404);
    await channel.update({
      avatar: result.secure_url,
    });
  } else if (type === "channelBanner") {
    const channel = await user.getChannel();
    if (channel.id !== processId) throw new AppError("Channel not found", 404);
    await channel.update({
      banner: result.secure_url,
    });
  } else if (type === "thumbnail") {
    const video = await Video.findByPk(processId);
    if (!video) throw new AppError("Video not found");
    await Video.update(
      { thumbnail: result.secure_url },
      { where: { id: processId } }
    );
  }

  await fs.unlink(file.path);

  return {
    imageUrl: result.secure_url,
  };
};

// GET /api/upload/status/:videoId
// Headers: Authorization
// Response: { status, progress?, error?, video_url? }
export const getUploadStatusService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  const videoStatus = {
    status: video.processing_status,
    progress: video.processing_message,
    videoUrl: video.url,
  };

  return videoStatus;
};
