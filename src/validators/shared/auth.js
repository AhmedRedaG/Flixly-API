import * as fields from "../fields/index.js";

export const register = [
  fields.firstName,
  fields.lastName,
  fields.username,
  fields.bio,
  fields.email,
  fields.password,
  fields.confirmPassword,
];

export const login = [fields.email, fields.password];

export const changePassword = [fields.oldPassword, fields.newPassword];
