import { body, query, param } from "express-validator";
import {
  idParam,
  pagination,
  sortBy,
  timeframeQuery,
  booleanQuery,
  optionalStringBody,
  requiredStringBody,
  optionalBooleanBody,
  optionalIsoDateBody,
  stringArrayBody,
  stringSearchQuery,
} from "../common.js";

// Discovery & search
export const listPublic = [
  ...pagination,
  ...sortBy(["newest", "trending", "popular"]),
  ...stringSearchQuery("tags"),
];

export const listTrending = [
  ...pagination,
  ...timeframeQuery(["day", "week", "month"]),
];

export const search = [
  ...pagination,
  ...sortBy(["relevance", "date", "views"]),
  ...stringSearchQuery("search"),
  ...stringSearchQuery("tags"),
];

// CRUD
export const create = [
  ...requiredStringBody("title", { min: 3, max: 256 }),
  ...optionalStringBody("description", { min: 1, max: 1000 }),
  ...stringArrayBody("tags", { itemMin: 1, itemMax: 32, maxItems: 20 }),
];

export const videoIdParam = [...idParam("videoId")];

export const update = [
  ...optionalStringBody("title", { min: 3, max: 256 }),
  ...optionalStringBody("description", { min: 1, max: 1000 }),
  ...optionalBooleanBody("is_private"),
  ...stringArrayBody("tags", { itemMin: 1, itemMax: 32, maxItems: 20 }),
];

export const publish = [...optionalIsoDateBody("publishAt")];

export const recordView = [
  ...idParam("videoId"),
  body("watchTime")
    .exists()
    .withMessage("watchTime is required")
    .bail()
    .isInt({ min: 0 })
    .withMessage("watchTime must be a non-negative integer")
    .toInt(),
];

export const reactionsQuery = [
  ...pagination,
  ...sortBy(["newest", "oldest", "popular"]),
  query("type")
    .optional()
    .isIn(["like", "dislike"])
    .withMessage("type must be like or dislike"),
];

export const commentsQuery = [
  ...pagination,
  ...sortBy(["newest", "oldest", "popular"]),
  query("parentCommentId")
    .optional()
    .isString()
    .isLength({ min: 1, max: 128 })
    .trim(),
];

export const commentBody = [
  body("content").exists().isString().isLength({ min: 1, max: 1000 }).trim(),
  body("parentCommentId")
    .optional()
    .isString()
    .isLength({ min: 1, max: 128 })
    .trim(),
];
