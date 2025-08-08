import { uploadImage, uploadVideo } from "../../config/multer.js";

// to conform to my multer's expected file structure
const videoType = (req, res, next) => {
  req.uploadType = "video";
  req.params.processId = req.params.videoId;
  next();
};

const imageType = (req, res, next) => {
  req.uploadType = req.query.type;
  next();
};

export const videoUploader = [videoType, uploadVideo.single("video_file")];
export const imageUploader = [imageType, uploadImage.single("image_file")];
