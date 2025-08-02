// GET /api/playlists/:playlistId
// Query: ?include_videos=true&page=1&limit=20
// Response: { playlist with videos?, pagination }

// POST /api/playlists
// Headers: Authorization
// Body: { name, description?, is_private?, channel_id? }
// Response: { playlist }

// PUT /api/playlists/:playlistId
// Headers: Authorization (playlist owner)
// Body: { name?, description?, is_private? }
// Response: { playlist }

// DELETE /api/playlists/:playlistId
// Headers: Authorization (playlist owner)
// Response: { message: "Playlist deleted" }

// POST /api/playlists/:playlistId/videos/:videoId
// Headers: Authorization (playlist owner)
// Response: { message: "Video added to playlist" }

// DELETE /api/playlists/:playlistId/videos/:videoId
// Headers: Authorization (playlist owner)
// Response: { message: "Video removed from playlist" }
