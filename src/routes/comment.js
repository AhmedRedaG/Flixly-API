// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest|popular&parent_id=?
// Response: { comments[], pagination }

// POST /api/videos/:videoId/comments
// Headers: Authorization
// Body: { content, parent_comment_id? }
// Response: { comment }

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
