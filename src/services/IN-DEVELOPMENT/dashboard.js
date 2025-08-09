/**
 * CREATOR DASHBOARD
 */
// GET /api/dashboard/overview
// Headers: Authorization (channel owner)
// Response: {
//   total_views, total_subscribers, total_videos,
//   recent_performance, top_videos
// }

// GET /api/dashboard/analytics
// Headers: Authorization (channel owner)
// Query: ?timeframe=day|week|month|year&metric=views|subscribers|revenue
// Response: { analytics_data[], charts_data }

// GET /api/dashboard/videos
// Headers: Authorization (channel owner)
// Query: ?page=1&limit=20&status=all|published|private|processing
// Response: { videos[], pagination }

/**
 * ADMIN DASHBOARD
 */
// GET /api/admin/stats
// Headers: Authorization (admin)
// Response: { total_users, total_videos, total_channels, system_health }

// GET /api/admin/users
// Headers: Authorization (admin)
// Query: ?page=1&limit=20&search=?&status=active|banned&role=user|admin
// Response: { users[], pagination }

// PUT /api/admin/users/:userId/ban
// Headers: Authorization (admin)
// Body: { reason, duration? }
// Response: { message: "User banned" }

// PUT /api/admin/users/:userId/unban
// Headers: Authorization (admin)
// Response: { message: "User unbanned" }
