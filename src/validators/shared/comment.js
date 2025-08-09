import { body } from "express-validator";
import { idParam, pagination, optionalStringBody } from "../common.js";

export const commentIdPath = [...idParam("commentId")];

export const update = [
  body("content").exists().isString().isLength({ min: 1, max: 1000 }).trim(),
];

export const repliesQuery = [...pagination];
