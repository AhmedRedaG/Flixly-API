import { body, validationResult } from "express-validator";

export const name = body("name", "Name must be valid.")
  .trim()
  .isLength({ min: 3, max: 256 })
  .matches(/^[A-Za-z\s]+$/);

export const email = body("email", "Email must be valid")
  .isEmail()
  .normalizeEmail();

export const password = body(
  "password",
  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
)
  .trim()
  .isStrongPassword()
  .isLength({ max: 64 });

export const confirmPassword = body(
  "confirmPassword",
  "Passwords must by the same."
)
  .trim()
  .custom((value, { req }) => {
    if (value !== req.body.password) return false;
    return true;
  });

const result = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors.array().forEach((err) => (errors[err.path] = err.msg));
    return res.jsend.fail({ ...errors }, 422);
  }

  next();
};

export default result;
