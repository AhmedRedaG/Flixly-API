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

// POST /api/upload/video
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { upload_url, processing_id }
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

// POST /api/upload/image
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { image_file, type: 'avatar'|'banner'|'thumbnail' }
// Response: { image_url }
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

// GET /api/upload/status/:videoId
// Headers: Authorization
// Response: { status, progress?, error?, video_url? }
router.get(
  "/status/:videoId",
  isAuth,
  uploadValidator.status,
  isValid,
  uploadController.getUploadStatus
);

export default router;
