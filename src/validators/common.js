import { body, param, query } from "express-validator";

export const pagination = [
  query("page")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];

export const stringSearchQuery = (name, { min = 1, max = 256 } = {}) => [
  query(name)
    .optional()
    .isString()
    .isLength({ min, max })
    .withMessage(
      `${name} must be a string with length between ${min} and ${max}`
    )
    .trim(),
];

export const sortBy = (allowedValues) => [
  query("sort")
    .optional()
    .isIn(allowedValues)
    .withMessage(`sort must be one of: ${allowedValues.join(", ")}`),
];

export const timeframeQuery = (allowedValues) => [
  query("timeframe")
    .optional()
    .isIn(allowedValues)
    .withMessage(`timeframe must be one of: ${allowedValues.join(", ")}`),
];

export const booleanQuery = (name) => [
  query(name)
    .optional()
    .isBoolean()
    .withMessage(`${name} must be a boolean`)
    .toBoolean(),
];

export const idParam = (name) => [
  param(name)
    .exists()
    .withMessage(`${name} is required`)
    .bail()
    .isString()
    .isLength({ min: 1, max: 128 })
    .withMessage(`${name} must be a non-empty id`)
    .trim(),
];

export const usernameParam = [
  param("username")
    .exists()
    .withMessage("username is required")
    .bail()
    .isString()
    .matches(/^[a-zA-Z0-9_]{3,16}$/)
    .withMessage("username must be 3-16 characters.")
    .trim(),
];

export const optionalUrl = (name) => [
  body(name)
    .optional()
    .isURL()
    .withMessage(`${name} must be a valid URL`)
    .trim(),
];

export const optionalStringBody = (name, { min = 1, max = 512 } = {}) => [
  body(name)
    .optional()
    .isString()
    .matches(/^a-zA-Z0-9.,!?'"()\-\s]$/)
    .isLength({ min, max })
    .withMessage(`${name} must be a string`)
    .trim(),
];

export const requiredStringBody = (name, { min = 1, max = 512 } = {}) => [
  body(name)
    .exists()
    .withMessage(`${name} is required`)
    .bail()
    .isString()
    .matches(/^a-zA-Z0-9.,!?'"()\-\s]$/)
    .isLength({ min, max })
    .withMessage(
      `${name} must be a string with length between ${min} and ${max}`
    )
    .trim(),
];

export const optionalBooleanBody = (name) => [
  body(name)
    .optional()
    .isBoolean()
    .withMessage(`${name} must be a boolean`)
    .toBoolean(),
];

export const optionalIsoDateBody = (name) => [
  body(name)
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(`${name} must be an ISO8601 date`),
];

export const stringArrayBody = (
  name,
  { itemMin = 1, itemMax = 64, maxItems = 50 } = {}
) => [
  body(name)
    .optional()
    .isArray({ max: maxItems })
    .withMessage(`${name} must be an array`),
  body(`${name}.*`)
    .optional()
    .isString()
    .isLength({ min: itemMin, max: itemMax })
    .withMessage(
      `${name} items must be strings with length between ${itemMin} and ${itemMax}`
    )
    .trim(),
];

// Auth-specific common validators
export const requiredName = (field) => [
  body(field)
    .exists()
    .isString()
    .matches(/^[A-Za-z]{3,256}$/)
    .withMessage(`${field} must be alphabetic and 3-256 characters long`)
    .trim(),
];

export const optionalName = (field) => [
  body(field)
    .optional()
    .isString()
    .matches(/^[A-Za-z]{3,256}$/)
    .withMessage(`${field} must be alphabetic and 3-256 characters long`)
    .trim(),
];

export const requiredUsernameBody = [
  body("username")
    .exists()
    .isString()
    .matches(/^[a-zA-Z0-9_]{3,16}$/)
    .withMessage("username must be 3-16 characters.")
    .trim(),
];

export const optionalUsernameBody = [
  body("username")
    .optional()
    .isString()
    .matches(/^[a-zA-Z0-9_]{3,16}$/)
    .withMessage("username must be 3-16 characters.")
    .trim(),
];

export const optionalBioBody = [
  body("bio")
    .optional()
    .isString()
    .matches(/^a-zA-Z0-9.,!?'"()\-\s]{3,256}$/)
    .withMessage(
      "bio must be minimum 3 maximum 256 characters and  A-Z a-z or space"
    )
    .trim(),
];

export const emailBody = [
  body("email").isEmail().withMessage("Email must be valid").normalizeEmail(),
];

export const strongPasswordBody = (field) => [
  body(field)
    .trim()
    .isStrongPassword()
    .isLength({ max: 64 })
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
];

export const confirmPasswordBody = (
  confirmField = "confirmPassword",
  targetField = "password"
) => [
  body(confirmField)
    .trim()
    .custom((value, { req }) => value === req.body[targetField])
    .withMessage("Passwords must be the same."),
];
