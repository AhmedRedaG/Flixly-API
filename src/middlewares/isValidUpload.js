import fs from "fs/promises";
import { fileTypeFromFile } from "file-type";

import AppError from "../utilities/appError.js";
import { constants } from "../../config/constants.js";

const { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } = constants.upload;

export const validateLocalUploadService = async (req, res, next) => {
  const { file, uploadType } = req;

  let allowedTypes;
  if (uploadType === "video") allowedTypes = ALLOWED_VIDEO_TYPES;
  else allowedTypes = ALLOWED_IMAGE_TYPES;

  try {
    if (!file) {
      const err = new Error("Error in uploading file, check your file type");
      err.statusCode = 415;
      throw err;
    }

    const fileType = await fileTypeFromFile(file.path);
    if (!fileType || !allowedTypes.includes(fileType.ext)) {
      const err = new Error(
        "Invalid file type. File content does not match expected format."
      );
      err.statusCode = 415;
      throw err;
    }

    next();
  } catch (err) {
    if (file?.path) {
      await fs.unlink(file.path).catch(console.error);
    }
    throw new AppError(err.message, err.statusCode);
  }
};
