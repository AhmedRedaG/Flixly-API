import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as commentController from "../controllers/comment.js";

const router = Router();

// PUT /api/comments/:commentId
// Headers: Authorization (comment owner)
// Body: { content }
// Response: { comment }
router.put("/:commentId", isAuth, commentController.updateComment);

// DELETE /api/comments/:commentId
// Headers: Authorization (comment owner or video owner)
// Response: { message: "Comment deleted" }
router.delete("/:commentId", isAuth, commentController.deleteComment);

// GET /api/comments/:commentId/replies
// Query: ?page=1&limit=10
// Response: { replies[], pagination }

export default router;
