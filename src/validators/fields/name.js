import { body } from "express-validator";

export const name = body("name", "Name must be valid.")
  .trim()
  .isLength({ min: 3, max: 256 })
  .matches(/^[A-Za-z\s]+$/);
