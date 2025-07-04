import { body } from "express-validator";

export const TFACode = body("TFACode", "Invalid 2FA code")
  .trim()
  .notEmpty()
  .isNumeric();

export const TFAMethod = body("method", "Invalid 2FA method")
  .trim()
  .notEmpty()
  .isIn(["sms", "totp"]);

export const backupCode = body("backupCode", "Invalid backupCode status")
  .trim()
  .notEmpty()
  .isBoolean();
