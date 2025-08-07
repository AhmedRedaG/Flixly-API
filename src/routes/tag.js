import { Router } from "express";

import * as tagController from "../controllers/tag.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

// GET /api/tags
// Query: ?search=?&limit=20&popular=true
// Response: { tags[] }
router.get("/", tagController.getTags);

// GET /api/tags/:tagId/videos
// Query: ?page=1&limit=20&sort=newest|popular
// Response: { videos[], pagination }
router.get("/:tagId/videos", tagController.getTagVideos);

// DELETE /api/tags/:tagId
// Headers: Authorization (admin only)
// Response: { message: "Tag deleted" }
router.delete("/:tagId", isAuth, tagController.deleteTag);

export default router;
