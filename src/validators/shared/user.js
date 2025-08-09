import {
  pagination,
  sortBy,
  usernameParam,
  optionalName,
  optionalBioBody,
  optionalUsernameBody,
} from "../common.js";

export const updateMe = [
  ...optionalName("firstName"),
  ...optionalName("lastName"),
  ...optionalBioBody,
  ...optionalUsernameBody,
];

export const usernamePath = [...usernameParam];

export const pagingOnly = [...pagination];

export const pagingWithSort = [...pagination, ...sortBy(["newest", "oldest"])];
