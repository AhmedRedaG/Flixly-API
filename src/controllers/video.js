import * as videoServer from "../services/video.js";

/**
 * VIDEO DISCOVERY & SEARCH
 */
// GET /api/videos
// Query: ?page=1&limit=20&sort=newest|trending|popular&category=?&search=?
// Response: { videos[], pagination, filters }
export const getMainPublicVideos = async (req, res) => {
  const { page, limit, sort, category, search } = req.query;
  const data = await videoServer.getMainPublicVideosService(
    page,
    limit,
    sort,
    tags
  );
  res.jsend.success(data);
};

// GET /api/videos/trending
// Query: ?page=1&limit=20&timeframe=day|week|month
// Response: { videos[], pagination }
export const getTrendingPublicVideos = async (req, res) => {
  const { page, limit, timeframe } = req.query;
  const data = await videoServer.getTrendingPublicVideosService(
    page,
    limit,
    timeframe
  );
  res.jsend.success(data);
};

// GET /api/videos/search
// Query: ?q=search_term&page=1&limit=20&sort=relevance|date|views
// Response: { videos[], pagination, suggestions[] }
export const searchPublicVideos = async (req, res) => {
  const { search, page, limit, sort, tags } = req.query;
  const data = await videoServer.searchPublicVideosService(
    search,
    page,
    limit,
    sort,
    tags
  );
  res.jsend.success(data);
};

// not now
// GET /api/videos/recommended
// Headers: Authorization (optional)
// Query: ?page=1&limit=20
// Response: { videos[], pagination }

/**
 * VIDEO CRUD
 */
// POST /api/videos
// Headers: Authorization
// Body: { title, description?, tags[] }
// Response: { video, upload_url? }
export const createVideo = async (req, res) => {
  const user = req.user;
  const { title, description, tags } = req.body;
  const data = await videoServer.createVideoService(
    user,
    title,
    description,
    tags
  );
  res.jsend.success(data, 201);
};

// GET /api/videos/:videoId
// Response: { video with channel, tags, comments?, view_count }
export const getPublicVideo = async (req, res) => {
  const { videoId } = req.params;
  const data = await videoServer.getPublicVideoService(videoId);
  res.jsend.success(data);
};

// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest|&parent_id=?
// Response: { comment }
export const getPublicVideoComments = async (req, res) => {
  const { videoId } = req.params;
  const { page, limit, sort, parent_id } = req.query;
  const data = await videoServer.getPublicVideoCommentsService(
    videoId,
    page,
    limit,
    sort,
    parent_id
  );
  res.jsend.success(data);
};

// GET /api/videos/:videoId
// Authorization: Bearer token
// Response: { video with channel, tags, comments?, view_count }
export const getVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await videoServer.getVideoService(user, videoId);
  res.jsend.success(data);
};

// PUT /api/videos/:videoId
// Headers: Authorization (video owner)
// Body: { title?, description?, thumbnail?, is_private?, tags[] }
// Response: { video }
export const updateVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { title, description, is_private, tags } = req.body;
  const data = await videoServer.updateVideoService(
    user,
    videoId,
    title,
    description,
    is_private,
    tags
  );
  res.jsend.success(data);
};

// DELETE /api/videos/:videoId
// Headers: Authorization (video owner)
// Response: { message: "Video deleted" }
export const deleteVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await videoServer.deleteVideoService(user, videoId);
  res.jsend.success(data);
};

// PATCH /api/videos/:videoId/publish
// Headers: Authorization (video owner)
// Body: { publish_at? } // null = publish now
// Response: { video }
export const publishVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { publish_at } = req.body;
  const data = await videoServer.publishVideoService(user, videoId, publish_at);
  res.jsend.success(data);
};

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
