import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as videoController from "../controllers/video.js";

const router = Router();

/**
 * VIDEO DISCOVERY & SEARCH
 */
// GET /api/videos
// Query: ?page=1&limit=20&sort=newest|trending|popular&category=?&search=?
// Response: { videos[], pagination, filters }
router.get("/", videoController.getMainPublicVideos);

// GET /api/videos/trending
// Query: ?page=1&limit=20&timeframe=day|week|month
// Response: { videos[], pagination }
router.get("/trending", videoController.getTrendingPublicVideos);

// GET /api/videos/search
// Query: ?q=search_term&page=1&limit=20&sort=relevance|date|views
// Response: { videos[], pagination, suggestions[] }
router.get("/search", videoController.searchPublicVideos);

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
router.post("/me", isAuth, videoController.createVideo);

// GET /api/videos/:videoId
// Response: { video with channel, tags, comments?, view_count }
router.get("/:videoId", videoController.getPublicVideo);

// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest|&parent_id=?
// Response: { comment }
router.get("/:videoId/comments", videoController.getPublicVideoComments);

// GET /api/videos/:videoId
// Authorization: Bearer token
// Response: { video with channel, tags, comments?, view_count }
router.get("/me/:videoId", isAuth, videoController.getVideo);

// PUT /api/videos/me/:videoId
// Headers: Authorization (video owner)
// Body: { title?, description?, thumbnail?, is_private?, tags[] }
// Response: { video }
router.put("/me/:videoId", isAuth, videoController.updateVideo);

// DELETE /api/videos/:videoId
// Headers: Authorization (video owner)
// Response: { message: "Video deleted" }
router.delete("/me/:videoId", isAuth, videoController.deleteVideo);

// PATCH /api/videos/:videoId/publish
// Headers: Authorization (video owner)
// Body: { publish_at? } // null = publish now
// Response: { video }
router.patch("/me/:videoId/publish", isAuth, videoController.publishVideo);

/**
 * VIDEO INTERACTIONS
 */
// POST /api/videos/:videoId/view
// Headers: Authorization
// Body: { watch_time } // seconds watched
// Response: { message: "View recorded" }
router.post("/:videoId/view", isAuth, videoController.recordVideoView);

// POST /api/videos/:videoId/like
// Headers: Authorization
// Response: { is_liked: true, likes_count, dislikes_count }
router.post("/:videoId/like", isAuth, videoController.likeVideo);

// POST /api/videos/:videoId/dislike
// Headers: Authorization
// Response: { is_liked: false, likes_count, dislikes_count }
router.post("/:videoId/dislike", isAuth, videoController.dislikeVideo);

// DELETE /api/videos/:videoId/reaction
// Headers: Authorization
// Response: { likes_count, dislikes_count }
router.delete(
  "/:videoId/reaction",
  isAuth,
  videoController.removeVideoReaction
);

// GET /api/videos/:videoId/reactions
// Headers: Authorization (video owner only)
// Query: ?page=1&limit=20&type=like|dislike
// Response: { reactions[], pagination }
router.get("/:videoId/reactions", isAuth, videoController.getVideoReactions);

// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest|popular&parent_id=?
// Response: { comments[], pagination }
router.get("/:videoId/comments", videoController.getVideoComments);

// POST /api/videos/:videoId/comments
// Headers: Authorization
// Body: { content, parent_comment_id? }
// Response: { comment }
router.post("/:videoId/comments", isAuth, videoController.createVideoComment);

export default router;
