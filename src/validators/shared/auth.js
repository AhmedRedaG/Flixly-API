import {
  requiredName,
  requiredUsernameBody,
  optionalBioBody,
  emailBody,
  strongPasswordBody,
  confirmPasswordBody,
} from "../common.js";

export const register = [
  ...requiredName("firstName"),
  ...requiredName("lastName"),
  ...requiredUsernameBody,
  ...optionalBioBody,
  ...emailBody,
  ...strongPasswordBody("password"),
  ...confirmPasswordBody("confirmPassword", "password"),
];

export const login = [...emailBody, ...strongPasswordBody("password")];

export const changePassword = [
  ...strongPasswordBody("oldPassword"),
  ...strongPasswordBody("newPassword"),
];
