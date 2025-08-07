import { Router } from "express";

import * as tagController from "../controllers/tag.js";

const router = Router();

// GET /api/tags
// Query: ?search=?&limit=20&popular=true
// Response: { tags[] }
router.get("/", tagController.getTags);

// GET /api/tags/:tagId/videos
// Query: ?page=1&limit=20&sort=newest|popular
// Response: { videos[], pagination }

// POST /api/tags
// Headers: Authorization (admin only)
// Body: { name }
// Response: { tag }

export default router;
