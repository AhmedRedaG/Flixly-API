import { query } from "express-validator";
import { idParam } from "../common.js";

export const uploadVideoId = [...idParam("videoId")];

export const uploadImageIdAndType = [
  ...idParam("processId"),
  query("type")
    .exists()
    .withMessage("type is required")
    .bail()
    .isIn(["userAvatar", "channelAvatar", "channelBanner", "thumbnail"])
    .withMessage(
      "type must be one of userAvatar, channelAvatar, channelBanner, thumbnail"
    ),
];

export const status = [...idParam("videoId")];
