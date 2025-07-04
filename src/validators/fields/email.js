import { body } from "express-validator";

export const email = body("email", "Email must be valid")
  .isEmail()
  .normalizeEmail();
