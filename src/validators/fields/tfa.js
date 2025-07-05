import { body } from "express-validator";

export const TFACode = body("TFACode", "Invalid 2FA code")
  .trim()
  .notEmpty()
  .isNumeric()
  .isLength({ min: 6, max: 8 });

export const TFAMethod = body("method", "Invalid 2FA method")
  .trim()
  .notEmpty()
  .isIn(["sms", "totp", "backup"]);
