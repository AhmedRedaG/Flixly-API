import { body } from "express-validator";

const defaultPassword = (field) =>
  body(
    field,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
  )
    .trim()
    .isStrongPassword()
    .isLength({ max: 64 });

export const password = defaultPassword("password");
export const oldPassword = defaultPassword("oldPassword");
export const newPassword = defaultPassword("newPassword");

export const confirmPassword = body(
  "confirmPassword",
  "Passwords must be the same."
)
  .trim()
  .custom((value, { req }) => value === req.body.password);
