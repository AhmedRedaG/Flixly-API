import { validationResult } from "express-validator";

const isValid = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors.array().forEach((err) => (errors[err.path] = err.msg));
    return res.jsend.fail({ message: "Invalid Data", ...errors }, 422);
  }

  next();
};

export default isValid;
