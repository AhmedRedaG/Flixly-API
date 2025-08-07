import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as uploadController from "../controllers/uploade.js";
import upload from "../../config/multer.js";

const router = Router();

// POST /api/upload/video
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { upload_url, processing_id }
router.post(
  "/video/:videoId",
  isAuth,
  upload.single("video_file"),
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
  upload.single("image_file"),
  uploadController.uploadImage
);

// GET /api/upload/status/:processingId
// Headers: Authorization
// Response: { status, progress?, error?, video_url? }

export default router;
