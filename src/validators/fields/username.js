import { body } from "express-validator";

export const username = body(
  "username",
  `username must be minimum 3 characters and start with a-z and can contain a number`
)
  .trim()
  .isLength({ min: 3, max: 256 })
  .matches(/^[a-z]+\d+$/);
