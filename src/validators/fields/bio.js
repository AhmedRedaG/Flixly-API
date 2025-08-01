import { body } from "express-validator";

export const bio = body(
  "bio",
  `bio must be minimum 3 maximum 256 characters and  A-Z a-z or space`
)
  .optional()
  .trim()
  .isLength({ min: 3, max: 256 })
  .matches(/^[A-Za-z\s]+\d+$/);
