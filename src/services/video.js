/**
 * VIDEO CRUD
 */
// POST /api/videos
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { title, description?, video_file, thumbnail?, tags[], is_private?, publish_at? }
// Response: { video, upload_url? }

// GET /api/videos/:videoId
// Query: ?include_comments=true&comments_page=1&comments_limit=10
// Response: { video with channel, tags, comments?, view_count }

// PUT /api/videos/:videoId
// Headers: Authorization (video owner)
// Body: { title?, description?, thumbnail?, is_private?, tags[] }
// Response: { video }

// DELETE /api/videos/:videoId
// Headers: Authorization (video owner)
// Response: { message: "Video deleted" }

// PATCH /api/videos/:videoId/publish
// Headers: Authorization (video owner)
// Body: { publish_at? } // null = publish now
// Response: { video }

/**
 * VIDEO DISCOVERY & SEARCH
 */
// GET /api/videos
// Query: ?page=1&limit=20&sort=newest|trending|popular&category=?&search=?
// Response: { videos[], pagination, filters }

// GET /api/videos/trending
// Query: ?page=1&limit=20&timeframe=day|week|month
// Response: { videos[], pagination }

// GET /api/videos/search
// Query: ?q=search_term&page=1&limit=20&sort=relevance|date|views
// Response: { videos[], pagination, suggestions[] }

// GET /api/videos/recommended
// Headers: Authorization (optional)
// Query: ?page=1&limit=20
// Response: { videos[], pagination }

/**
 * VIDEO INTERACTIONS
 */
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

// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest|popular&parent_id=?
// Response: { comments[], pagination }

// POST /api/videos/:videoId/comments
// Headers: Authorization
// Body: { content, parent_comment_id? }
// Response: { comment }
