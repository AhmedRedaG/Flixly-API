// POST /api/upload/video
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { video_file }
// Response: { upload_url, processing_id }

// POST /api/upload/image
// Headers: Authorization
// Content-Type: multipart/form-data
// Body: { image_file, type: 'avatar'|'banner'|'thumbnail' }
// Response: { image_url }

// GET /api/upload/status/:processingId
// Headers: Authorization
// Response: { status, progress?, error?, video_url? }
