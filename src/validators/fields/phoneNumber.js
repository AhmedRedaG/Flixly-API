import { body } from "express-validator";

export const phoneNumber = body("phoneNumber", "Phone number must be valid")
  .trim()
  .isMobilePhone("any", { strictMode: true });
