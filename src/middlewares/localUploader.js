import { fileTypeFromFile } from "file-type";
import fs from "fs/promises";

import AppError from "../utilities/appError.js";
import { uploadImage, uploadVideo } from "../../config/multer.js";

const videoType = (req, res, next) => {
  req.uploadType = "video";
  req.params.processId = req.params.videoId;
  next();
};

const imageType = (req, res, next) => {
  req.uploadType = req.query.type;
  next();
};

const validateUploadedFile = async (req, res, next) => {
  if (!req.file)
    throw new AppError(
      "File content does not match expected image format.",
      415
    );

  try {
    const fileType = await fileTypeFromFile(req.file.path);
    const allowedImageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
    const allowedVideoTypes = ["mp4", "mov", "avi", "mkv", "webm"];

    if (
      !fileType ||
      (req.uploadType === "video" &&
        !allowedVideoTypes.includes(fileType.ext)) ||
      (req.uploadType !== "video" && !allowedImageTypes.includes(fileType.ext))
    ) {
      await fs.unlink(req.file.path);
      throw new AppError(
        "Invalid file type. File content does not match expected format.",
        415
      );
    }

    next();
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
};

export const videoUploader = [
  videoType,
  uploadVideo.single("video_file"),
  validateUploadedFile,
];
export const imageUploader = [
  imageType,
  uploadImage.single("image_file"),
  validateUploadedFile,
];
