import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as uploadController from "../controllers/upload.js";
import { videoUploader, imageUploader } from "../middlewares/localUploader.js";
import isValid from "../middlewares/isValid.js";
import * as uploadValidator from "../validators/shared/upload.js";

const router = Router();

// POST /api/upload/video
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { upload_url, processing_id }
router.post(
  "/video/:videoId",
  isAuth,
  uploadValidator.uploadVideo,
  isValid,
  videoUploader,
  uploadController.uploadVideo
);

// POST /api/upload/image
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { image_file, type: 'avatar'|'banner'|'thumbnail' }
// Response: { image_url }
router.post(
  "/image/:processId",
  isAuth,
  uploadValidator.uploadImage,
  isValid,
  imageUploader,
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
