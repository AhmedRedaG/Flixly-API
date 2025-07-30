import * as fields from "../fields/index.js";

export const register = [
  fields.name,
  fields.email,
  fields.password,
  fields.confirmPassword,
];

export const login = [fields.email, fields.password];

export const changePassword = [fields.oldPassword, fields.newPassword];
