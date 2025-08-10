import { Router } from "express";

import * as tagController from "../controllers/tag.js";
import { isAuth } from "../middlewares/isAuth.js";
import isValid from "../middlewares/isValid.js";
import * as tagValidator from "../validators/shared/tag.js";

const router = Router();

// GET tags
// Query: ?search=?&page=1&limit=20&popular=true
// Response: { tags[], pagination }
router.get("/", tagValidator.list, isValid, tagController.getTags);

// GET tags/:tagId/videos
// Query: ?page=1&limit=20&sort=newest|oldest|popular
// Response: { videos[], pagination }
router.get(
  "/:tagId/videos",
  tagValidator.listVideos,
  isValid,
  tagController.getTagVideos
);

// DELETE tags/:tagId
// Headers: Authorization (admin only)
// Response: { message: "Tag deleted successfully" }
router.delete(
  "/:tagId",
  isAuth,
  tagValidator.tagIdPath,
  isValid,
  tagController.deleteTag
);

export default router;
