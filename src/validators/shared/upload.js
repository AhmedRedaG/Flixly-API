import { query } from "express-validator";
import { idParam } from "../common.js";

export const uploadVideo = [...idParam("videoId")];

export const uploadImage = [
  ...idParam("processId"),
  query("type")
    .exists()
    .withMessage("type is required")
    .bail()
    .isIn(["avatar", "banner", "thumbnail"])
    .withMessage("type must be one of avatar, banner, thumbnail"),
];

export const status = [...idParam("videoId")];
