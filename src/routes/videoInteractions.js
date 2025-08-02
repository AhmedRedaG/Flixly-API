// POST /api/videos/:videoId/view
// Headers: Authorization (optional)
// Body: { watch_time } // seconds watched
// Response: { message: "View recorded" }

// POST /api/videos/:videoId/like
// Headers: Authorization
// Response: { is_liked: true, likes_count, dislikes_count }

// POST /api/videos/:videoId/dislike
// Headers: Authorization
// Response: { is_liked: false, likes_count, dislikes_count }

// DELETE /api/videos/:videoId/reaction
// Headers: Authorization
// Response: { likes_count, dislikes_count }

// GET /api/videos/:videoId/reactions
// Headers: Authorization (video owner only)
// Query: ?page=1&limit=20&type=like|dislike
// Response: { reactions[], pagination }
