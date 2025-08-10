import {
  pagination,
  sortBy,
  usernameParam,
  optionalName,
  optionalBioBody,
  optionalUsernameBody,
  strongPasswordBody,
} from "../common.js";

export const updateMe = [
  ...optionalName("firstName"),
  ...optionalName("lastName"),
  ...optionalBioBody,
  ...optionalUsernameBody,
];

export const changePassword = [
  ...strongPasswordBody("oldPassword"),
  ...strongPasswordBody("newPassword"),
];

export const usernamePath = [...usernameParam];

export const pagingOnly = [...pagination];

export const pagingWithSort = [...pagination, ...sortBy(["newest", "oldest"])];
