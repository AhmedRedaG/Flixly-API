import { v2 as cloudinary } from "cloudinary";

import * as configs from "./index.js";
import { constants } from "./constants.js";

const { cloudName, apiKey, apiSecret } = configs.env.cloudinary;
const { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, CLOUDINARY_UPLOAD_TIMEOUT } =
  constants.upload;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export const videoUploadOptions = () => {
  return {
    resource_type: "video",
    folder: "flixly/videos",
    quality: "auto",
    fetch_format: "auto",
    use_filename: true,
    unique_filename: false,
    allowed_formats: ALLOWED_VIDEO_TYPES,
    timeout: CLOUDINARY_UPLOAD_TIMEOUT,
    eager: [
      { width: 1280, height: 720, crop: "limit", quality: "auto" },
      { width: 640, height: 360, crop: "limit", quality: "auto" },
    ],
    eager_async: true,
  };
};

export const imageUploadOptions = (type) => {
  return {
    resource_type: "image",
    folder: `flixly/images/${type}`,
    quality: "auto",
    fetch_format: "auto",
    use_filename: true,
    unique_filename: false,
    allowed_formats: ALLOWED_IMAGE_TYPES,
    timeout: CLOUDINARY_UPLOAD_TIMEOUT,
    overwrite: true,
    invalidate: true,
  };
};

export default cloudinary;
