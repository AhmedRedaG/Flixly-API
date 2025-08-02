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
