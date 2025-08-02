// PUT /api/comments/:commentId
// Headers: Authorization (comment owner)
// Body: { content }
// Response: { comment }

// DELETE /api/comments/:commentId
// Headers: Authorization (comment owner or video owner)
// Response: { message: "Comment deleted" }

// GET /api/comments/:commentId/replies
// Query: ?page=1&limit=10
// Response: { replies[], pagination }
