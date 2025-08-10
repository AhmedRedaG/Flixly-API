import fs from "fs/promises";

import AppError from "../utilities/appError.js";
import { db, sequelize } from "../../database/models/index.js";
import cloudinary, {
  imageUploadOptions,
  videoUploadOptions,
} from "../../config/cloudinary.js";

const { Video, Channel, User } = db;

export const remoteUploadVideoService = async (video, file) => {
  const transaction = await sequelize.transaction();
  try {
    await video.update(
      {
        processing_status: "processing",
        processing_message: "video uploading...",
      },
      { transaction }
    );

    const uploadOptions = videoUploadOptions();
    const result = await cloudinary.uploader.upload(file.path, uploadOptions);

    await video.update(
      {
        processing_status: video.thumbnail ? "completed" : "processing",
        processing_message: video.thumbnail
          ? "ready to publish :)"
          : "video uploaded successfully, waiting to upload thr thumbnail",
        url: result.secure_url,
        duration: result.duration,
      },
      { transaction }
    );

    await Promise.all([transaction.commit(), fs.unlink(file.path)]);
  } catch (err) {
    await Promise.all([
      transaction.rollback(),
      video.update({
        processing_status: "failed",
        processing_message: "error in uploading video...",
      }),
      fs.unlink(file.path),
    ]);

    throw err;
  }

  return {
    message: "Video uploaded successfully",
  };
};

export const remoteUploadImageService = async (
  user,
  channel,
  video,
  file,
  type
) => {
  try {
    const uploadOptions = imageUploadOptions(type);
    const result = await cloudinary.uploader.upload(file.path, uploadOptions);

    switch (type) {
      case "userAvatar":
        await user.update({ avatar: result.secure_url });
        break;
      case "channelAvatar":
        await channel.update({ avatar: result.secure_url });
        break;
      case "channelBanner":
        await channel.update({ banner: result.secure_url });
        break;
      case "thumbnail":
        await video.update({
          processing_status: video.url ? "completed" : "processing",
          processing_message: video.url
            ? "ready to publish :)"
            : "thumbnail uploaded successfully, waiting to upload the video",
          thumbnail: result.secure_url,
        });
        break;
    }

    await fs.unlink(file.path);
  } catch (err) {
    await fs.unlink(file.path);
    throw err;
  }

  return {
    message: "Image uploaded successfully",
  };
};

export const getUploadStatusService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  const videoStatus = {
    status: video.processing_status,
    progress: video.processing_message,
  };

  return videoStatus;
};
