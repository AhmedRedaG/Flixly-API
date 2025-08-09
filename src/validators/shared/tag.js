import { query } from "express-validator";
import { idParam, pagination, sortBy, stringSearchQuery } from "../common.js";

export const list = [
  ...stringSearchQuery("search"),
  query("popular").optional().isBoolean().toBoolean(),
  query("limit").optional().toInt().isInt({ min: 1, max: 100 }),
];

export const listVideos = [
  ...idParam("tagId"),
  ...pagination,
  ...sortBy(["newest", "popular"]),
];

export const tagIdPath = [...idParam("tagId")];
