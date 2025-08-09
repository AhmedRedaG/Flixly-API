import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import isValid from "../middlewares/isValid.js";
import * as videoValidator from "../validators/shared/video.js";
import * as videoController from "../controllers/video.js";

const router = Router();

/**
 * VIDEO DISCOVERY & SEARCH
 */
// GET videos
// Query: ?page=1&limit=20&sort=newest|popular
// Response: { videos[], pagination }
router.get(
  "/",
  videoValidator.listPublic,
  isValid,
  videoController.getMainPublicVideos
);

// GET /api/videos/trending
// Query: ?page=1&limit=20&timeframe=day|week|month
// Response: { videos[], pagination }
router.get(
  "/trending",
  videoValidator.listTrending,
  isValid,
  videoController.getTrendingPublicVideos
);

// GET videos/search
// Query: ?q=search_term&page=1&limit=20&sort=relevance|newest|oldest|popular&tags=?,?,...
// Response: { videos[], pagination }
router.get(
  "/search",
  videoValidator.search,
  isValid,
  videoController.searchPublicVideos
);

/**
 * VIDEO CRUD
 */
// POST videos
// Headers: Authorization
// Body: { title, description?, tags[] }
// Response: { video with tags, video upload url, thumbnail upload url}
router.post(
  "/me",
  isAuth,
  videoValidator.create,
  isValid,
  videoController.createVideo
);

// GET videos/:videoId
// Response: { video data with channel and comments }
router.get(
  "/:videoId",
  videoValidator.videoIdParam,
  isValid,
  videoController.getPublicVideo
);

// GET videos/me/:videoId
// Headers: Authorization (video owner)
// Response: { video data with comments }
router.get(
  "/me/:videoId",
  isAuth,
  videoValidator.videoIdParam,
  isValid,
  videoController.getVideo
);

// PUT videos/me/:videoId
// Headers: Authorization (video owner)
// Body: { title?, description?, is_private? }
// Response: { video }
router.put(
  "/me/:videoId",
  isAuth,
  [...videoValidator.videoIdParam, ...videoValidator.update],
  isValid,
  videoController.updateVideo
);

// DELETE videos/me/:videoId
// Headers: Authorization (video owner)
// Response: { message: "Video deleted successfully" }
router.delete(
  "/me/:videoId",
  isAuth,
  videoValidator.videoIdParam,
  isValid,
  videoController.deleteVideo
);

// PATCH videos/me/:videoId/publish
// Headers: Authorization (video owner)
// Body: { publish_at? } // null = publish now
// Response: { video }
router.patch(
  "/me/:videoId/publish",
  isAuth,
  [...videoValidator.videoIdParam, ...videoValidator.publish],
  isValid,
  videoController.publishVideo
);

/**
 * VIDEO INTERACTIONS
 */
// POST videos/:videoId/view
// Headers: Authorization
// Body: { watch_time } // seconds watched
// Response: { watchedAt, watchTime, viewsCount }
router.post(
  "/:videoId/view",
  isAuth,
  ...videoValidator.recordView,
  isValid,
  videoController.recordVideoView
);

// POST videos/:videoId/like
// Headers: Authorization
// Response: { is_liked: true, likes_count, dislikes_count }
router.post(
  "/:videoId/like",
  isAuth,
  videoValidator.videoIdParam,
  isValid,
  videoController.likeVideo
);

// POST videos/:videoId/dislike
// Headers: Authorization
// Response: { is_liked: false, likes_count, dislikes_count }
router.post(
  "/:videoId/dislike",
  isAuth,
  videoValidator.videoIdParam,
  isValid,
  videoController.dislikeVideo
);

// DELETE videos/:videoId/reaction
// Headers: Authorization
// Response: { is_liked: null, likes_count, dislikes_count }
router.delete(
  "/:videoId/reaction",
  isAuth,
  videoValidator.videoIdParam,
  isValid,
  videoController.removeVideoReaction
);

// GET videos/me/:videoId/reactions
// Headers: Authorization (video owner only)
// Query: ?page=1&limit=20&type=like|dislike
// Response: { reactions[], pagination }
router.get(
  "/:videoId/reactions",
  isAuth,
  [...videoValidator.videoIdParam, ...videoValidator.reactionsQuery],
  isValid,
  videoController.getVideoReactions
);

// GET videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest&parentCommentId=?
// Response: { comments[], pagination }
router.get(
  "/:videoId/comments",
  [...videoValidator.videoIdParam, ...videoValidator.commentsQuery],
  isValid,
  videoController.getPublicVideoComments
);

// POST videos/:videoId/comments
// Headers: Authorization
// Body: { content, parent_comment_id? }
// Response: { comment }
router.post(
  "/:videoId/comments",
  isAuth,
  [...videoValidator.videoIdParam, ...videoValidator.commentBody],
  isValid,
  videoController.createVideoComment
);

export default router;
