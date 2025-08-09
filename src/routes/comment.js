import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as commentController from "../controllers/comment.js";
import isValid from "../middlewares/isValid.js";
import * as commentValidator from "../validators/shared/comment.js";

const router = Router();

// PUT comments/:commentId
// Headers: Authorization (comment owner)
// Body: { content }
// Response: { comment }
router.put(
  "/:commentId",
  isAuth,
  [...commentValidator.commentIdPath, ...commentValidator.update],
  isValid,
  commentController.updateComment
);

// DELETE comments/:commentId
// Headers: Authorization (comment owner or video owner)
// Response: { message: "Comment deleted successfully" }
router.delete(
  "/:commentId",
  isAuth,
  commentValidator.commentIdPath,
  isValid,
  commentController.deleteComment
);

// GET comments/:commentId/replies
// Query: ?page=1&limit=10
// Response: { replies[], pagination }
router.get(
  "/:commentId/replies",
  [...commentValidator.commentIdPath, ...commentValidator.repliesQuery],
  isValid,
  commentController.getCommentReplies
);

export default router;
