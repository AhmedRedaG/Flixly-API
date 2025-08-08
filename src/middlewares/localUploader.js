import { uploadImage, uploadVideo } from "../../config/multer.js";

// to conform to my multer's expected file structure
const videoType = (req, res, next) => {
  req.query.type = "video";
  req.params.processId = req.params.videoId;
  next();
};

export const videoUploader = [videoType, uploadVideo.single("video_file")];
export const imageUploader = uploadImage.single("image_file");
