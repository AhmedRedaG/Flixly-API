import { idParam, pagination, optionalStringBody } from "../common.js";

export const commentIdPath = [...idParam("commentId")];

export const update = [...optionalStringBody("content", { min: 1, max: 1000 })];

export const repliesQuery = [...pagination];
