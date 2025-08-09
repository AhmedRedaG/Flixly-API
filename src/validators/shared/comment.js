import { idParam, pagination, requiredStringBody } from "../common.js";

export const commentIdPath = [...idParam("commentId")];

export const update = [...requiredStringBody("content", { min: 1, max: 1000 })];

export const repliesQuery = [...pagination];
