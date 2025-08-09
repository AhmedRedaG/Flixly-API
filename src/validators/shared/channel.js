import { body } from "express-validator";
import {
  pagination,
  sortBy,
  booleanQuery,
  usernameParam,
  optionalStringBody,
  requiredStringBody,
  optionalUrl,
  optionalUsernameBody,
} from "../common.js";

export const create = [
  optionalUsernameBody,
  requiredStringBody("name", { min: 3, max: 256 }),
  optionalStringBody("description", { min: 1, max: 1000 }),
  ...optionalUrl("avatar"),
  ...optionalUrl("banner"),
];

export const update = [
  body("username")
    .optional()
    .isString()
    .matches(/^[a-zA-Z0-9_]{3,16}$/)
    .withMessage(
      "username must be minimum 3 characters, start with a-z and can contain a number"
    )
    .trim(),
  optionalStringBody("name", { min: 3, max: 256 }),
  optionalStringBody("description", { min: 1, max: 1000 }),
  ...optionalUrl("avatar"),
  ...optionalUrl("banner"),
];

export const usernamePath = [...usernameParam];

export const listMyVideosQuery = [
  ...pagination,
  ...sortBy(["newest", "oldest", "popular"]),
  ...booleanQuery("privateOnly"),
  ...booleanQuery("unpublishedOnly"),
];

export const listPublicVideosQuery = [
  ...pagination,
  ...sortBy(["newest", "oldest", "popular"]),
];

export const listSubscribersQuery = [
  ...pagination,
  ...sortBy(["newest", "oldest"]),
];
