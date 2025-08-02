// POST /api/channels/:channelId/subscribe
// Headers: Authorization
// Response: { subscribed: true, subscribers_count }

// DELETE /api/channels/:channelId/subscribe
// Headers: Authorization
// Response: { subscribed: false, subscribers_count }

// GET /api/users/me/subscriptions
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { subscriptions[], pagination }

// GET /api/users/me/subscriptions/feed
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos from subscribed channels[], pagination }