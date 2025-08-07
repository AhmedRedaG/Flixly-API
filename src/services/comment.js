import AppError from "../utilities/appError.js";
import { db } from "../../database/models/index.js";

const { VideoComment } = db;

// PUT /api/comments/:commentId
// Headers: Authorization (comment owner)
// Body: { content }
// Response: { comment }
export const updateCommentService = async (user, commentId, content) => {
  const comment = await VideoComment.findByPk(commentId);
  if (!comment) throw new AppError("Comment not found", 404);

  if (comment.user_id !== user.id)
    throw new AppError("Unauthorized to update comment", 401);

  await comment.update({ content });

  return comment;
};

// DELETE /api/comments/:commentId
// Headers: Authorization (comment owner or video owner)
// Response: { message: "Comment deleted" }

// GET /api/comments/:commentId/replies
// Query: ?page=1&limit=10
// Response: { replies[], pagination }
