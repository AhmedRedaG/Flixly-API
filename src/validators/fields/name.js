import { body } from "express-validator";

const name = (field) => {
  return body(field, `${field} must be valid.`)
    .trim()
    .isLength({ min: 3, max: 256 })
    .matches(/^[A-Za-z]+$/);
};

export const firstName = name("firstName");
export const lastName = name("lastName");
