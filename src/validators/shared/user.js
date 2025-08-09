import { body, query } from "express-validator";
import { pagination, optionalStringBody, usernameParam } from "../common.js";

export const updateMe = [
  body("firstName")
    .optional()
    .isString()
    .isLength({ min: 3, max: 256 })
    .matches(/^[A-Za-z]+$/)
    .trim(),
  body("lastName")
    .optional()
    .isString()
    .isLength({ min: 3, max: 256 })
    .matches(/^[A-Za-z]+$/)
    .trim(),
  body("username")
    .optional()
    .isString()
    .matches(/^[a-zA-Z0-9_]{3,16}$/)
    .withMessage(
      "username must be minimum 3 characters, start with a-z and can contain a number"
    )
    .trim(),
  body("bio")
    .optional()
    .isString()
    .isLength({ min: 3, max: 256 })
    .matches(/^[A-Za-z\s]+\d+$/)
    .withMessage(
      "bio must be minimum 3 maximum 256 characters and  A-Z a-z or space"
    )
    .trim(),
  body("avatar")
    .optional()
    .isURL()
    .withMessage("avatar must be a valid URL")
    .trim(),
];

export const usernamePath = [...usernameParam];

export const pagingOnly = [...pagination];
