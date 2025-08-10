import multer from "multer";
import fs from "fs";
import path from "path";

import { constants } from "./constants.js";

const { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } = constants.upload;

try {
  fs.mkdirSync(path.join(process.cwd(), "uploads", "temp"), {
    recursive: true,
  });
} catch (err) {
  throw err;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = `uploads/temp`;
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      req.uploadType + "_" + req.user.id + "_" + req.params.processId;
    cb(null, uniqueSuffix);
  },
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(null, false);
};

const videoFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) cb(null, true);
  else cb(null, false);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
});

const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

export { uploadImage, uploadVideo };
