import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as uploadController from "../controllers/upload.js";
import {
  localVideoUploader,
  localImageUploader,
} from "../middlewares/localUploader.js";
import {
  isUserUploadVideoAllowed,
  isUserUploadImageAllowed,
} from "../middlewares/isAllowedToUpload.js";
import isValid from "../middlewares/isValid.js";
import isValidLocalUploadedFile from "../middlewares/isValidUpload.js";
import * as uploadValidator from "../validators/shared/upload.js";

const router = Router();

// POST upload/video/:videoId
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { message: "Video uploaded successfully" }
router.post(
  "/video/:videoId",
  uploadValidator.uploadVideoId,
  isValid,
  isAuth,
  isUserUploadVideoAllowed,
  localVideoUploader,
  isValidLocalUploadedFile,
  uploadController.uploadVideo
);

// POST upload/image/:processId?type=userAvatar|channelAvatar|channelBanner|thumbnail
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { image_file }
// Response: { message: "Image uploaded successfully" }
router.post(
  "/image/:processId",
  uploadValidator.uploadImageIdAndType,
  isValid,
  isAuth,
  isUserUploadImageAllowed,
  localImageUploader,
  isValidLocalUploadedFile,
  uploadController.uploadImage
);

// GET upload/status/:videoId
// Headers: Authorization
// Response: { status, progress }
router.get(
  "/status/:videoId",
  isAuth,
  uploadValidator.status,
  isValid,
  uploadController.getUploadStatus
);

export default router;
