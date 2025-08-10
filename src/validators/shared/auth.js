import { body } from "express-validator";
import {
  requiredName,
  requiredUsernameBody,
  optionalBioBody,
  emailBody,
  strongPasswordBody,
  confirmPasswordBody,
} from "../common.js";
import { constants } from "../../../config/constants.js";

const { OTP_MIN, OTP_MAX } = constants.otp;

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

export const requestReset = [...emailBody];

export const resetPassword = [
  ...emailBody,
  ...strongPasswordBody("password"),
  body("otp")
    .exists()
    .toInt()
    .isInt({ min: OTP_MIN, max: OTP_MAX })
    .withMessage(`limit must be between ${OTP_MIN} and ${OTP_MAX}`),
];
