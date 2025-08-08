import AppError from "../utilities/appError.js";
import { db } from "../../database/models/index.js";

const { VideoComment, User } = db;

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
export const deleteCommentService = async (user, commentId) => {
  const comment = await VideoComment.findByPk(commentId);
  if (!comment) throw new AppError("Comment not found", 404);

  if (comment.user_id !== user.id) {
    const [video, channel] = await Promise.all([
      comment.getVideo(),
      user.getChannel(),
    ]);
    if (video.channel_id !== channel.id)
      throw new AppError("Unauthorized to delete comment", 401);
  }

  const childComments = await comment.child_comments_count;
  await video.decrement("comments_count", { by: childComments + 1 });
  await comment.destroy();

  return {
    message: "Comment deleted successfully",
  };
};

// GET /api/comments/:commentId/replies
// Query: ?page=1&limit=10
// Response: { replies[], pagination }
export const getCommentRepliesService = async (commentId, inPage, inLimit) => {
  const limit = inLimit || 10;
  const page = inPage || 1;
  const offset = (page - 1) * limit;

  const replies = await VideoComment.findAll({
    where: { parent_comment_id: commentId },
    include: {
      model: User,
      as: "user",
      attributes: ["username", "firstName", "lastName", "avatar"],
    },
    limit,
    offset,
  });
  const total = replies?.length || 0;

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    replies,
    pagination,
  };
};
