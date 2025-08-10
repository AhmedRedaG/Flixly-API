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

export const localVideoUploader = [videoType, uploadVideo.single("video_file")];
export const localImageUploader = [imageType, uploadImage.single("image_file")];
