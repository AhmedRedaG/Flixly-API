// POST /api/reports
// Headers: Authorization
// Body: { target_type: 'video'|'comment', target_id, reason }
// Response: { report }

// GET /api/reports (Admin only)
// Headers: Authorization (admin)
// Query: ?page=1&limit=20&status=pending|reviewed|dismissed&target_type=?
// Response: { reports[], pagination }

// PUT /api/reports/:reportId
// Headers: Authorization (admin)
// Body: { status: 'reviewed'|'dismissed' }
// Response: { report }

// DELETE /api/reports/:reportId
// Headers: Authorization (admin)
// Response: { message: "Report deleted" }
