// GET /api/tags
// Query: ?search=?&limit=20&popular=true
// Response: { tags[] }

// GET /api/tags/:tagId/videos
// Query: ?page=1&limit=20&sort=newest|popular
// Response: { videos[], pagination }

// POST /api/tags
// Headers: Authorization (admin only)
// Body: { name }
// Response: { tag }
