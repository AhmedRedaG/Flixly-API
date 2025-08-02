// POST /api/channels
// Headers: Authorization
// Body: { username, name, description, avatar?, banner? }
// Response: { channel }

// GET /api/channels/:channelId
// Response: { channel with stats, recent videos }

// GET /api/channels/username/:username
// Response: { channel with stats, recent videos }

// PUT /api/channels/:channelId
// Headers: Authorization (channel owner)
// Body: { name?, description?, avatar?, banner? }
// Response: { channel }

// DELETE /api/channels/:channelId
// Headers: Authorization (channel owner)
// Response: { message: "Channel deleted" }

// GET /api/channels/:channelId/videos
// Query: ?page=1&limit=20&sort=newest|oldest|popular
// Response: { videos[], pagination }

// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20
// Response: { playlists[], pagination }

// GET /api/channels/:channelId/subscribers
// Headers: Authorization (channel owner only)
// Query: ?page=1&limit=20
// Response: { subscribers[], pagination }
