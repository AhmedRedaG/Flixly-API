import * as commentServer from "../services/comment.js";

// PUT /api/comments/:commentId
// Headers: Authorization (comment owner)
// Body: { content }
// Response: { comment }
export const updateComment = async (req, res) => {
  const user = req.user;
  const { commentId } = req.params;
  const { content } = req.body;
  const data = await commentServer.updateCommentService(
    user,
    commentId,
    content
  );
  res.jsend.success(data);
};

// DELETE /api/comments/:commentId
// Headers: Authorization (comment owner or video owner)
// Response: { message: "Comment deleted" }
export const deleteComment = async (req, res) => {
  const user = req.user;
  const { commentId } = req.params;
  const data = await commentServer.deleteCommentService(user, commentId);
  res.jsend.success(data);
};

// GET /api/comments/:commentId/replies
// Query: ?page=1&limit=10
// Response: { replies[], pagination }
export const getCommentReplies = async (req, res) => {
  const { commentId } = req.params;
  const { page, limit } = req.query;
  const data = await commentServer.getCommentRepliesService(
    commentId,
    page,
    limit
  );
  res.jsend.success(data);
};
