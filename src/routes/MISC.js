// ==========================================
// MISCELLANEOUS
// ==========================================

/**
 * SEARCH & SUGGESTIONS
 */
// GET /api/search/suggestions
// Query: ?q=partial_query&limit=10
// Response: { suggestions[] }

// GET /api/search/autocomplete
// Query: ?q=partial_query&type=videos|channels|tags
// Response: { autocomplete[] }

/**
 * SYSTEM ENDPOINTS
 */
// GET /api/health
// Response: { status: "ok", timestamp, version }

// GET /api/config
// Response: { max_file_size, supported_formats, features }

/**
 * NOTIFICATIONS
 */
// GET /api/notifications
// Headers: Authorization
// Query: ?page=1&limit=20&unread_only=true
// Response: { notifications[], unread_count }

// PUT /api/notifications/:notificationId/read
// Headers: Authorization
// Response: { message: "Marked as read" }

// PUT /api/notifications/read-all
// Headers: Authorization
// Response: { message: "All notifications marked as read" }
