import { body } from "express-validator";
import {
  pagination,
  sortBy,
  booleanQuery,
  usernameParam,
  optionalStringBody,
  requiredStringBody,
  requiredUsernameBody,
  optionalUsernameBody,
} from "../common.js";

export const create = [
  ...requiredUsernameBody,
  ...requiredStringBody("name", { min: 3, max: 256 }),
  ...requiredStringBody("description", { min: 1, max: 1000 }),
];

export const update = [
  ...optionalStringBody("name", { min: 3, max: 256 }),
  ...optionalStringBody("description", { min: 1, max: 1000 }),
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
