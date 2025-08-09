import { Router } from "express";

import * as channelController from "../controllers/channel.js";
import { isAuth } from "../middlewares/isAuth.js";
import isValid from "../middlewares/isValid.js";
import * as channelValidator from "../validators/shared/channel.js";

const router = Router();

// POST channels/
// Headers: Authorization
// Body: { username, name, description }
// Response: { channel }
router.post(
  "/me",
  isAuth,
  channelValidator.create,
  isValid,
  channelController.createChannel
);

// GET channels/me
// Headers: Authorization (channel owner)
// Response: { channel with stats, recent videos }
router.get("/me", isAuth, channelController.getChannel);

// GET channels/:username
// Response: { channel with stats, recent videos }
router.get(
  "/:username",
  channelValidator.usernamePath,
  isValid,
  channelController.getPublicChannel
);

// PUT channels/me
// Headers: Authorization (channel owner)
// Body: { name?, description? }
// Response: { channel }
router.put(
  "/me",
  isAuth,
  channelValidator.update,
  isValid,
  channelController.updateChannel
);

// DELETE channels/me
// Headers: Authorization (channel owner)
// Response: { message: "Channel deleted successfully" }
router.delete("/me", isAuth, channelController.deleteChannel);

// GET channels/me/videos
// Headers: Authorization (channel owner)
// Query: ?page=1&limit=20&sort=newest|oldest|popular&privateOnly=true|false&unpublishedOnly=true|false
// Response: { videos[], pagination }
router.get(
  "/me/videos",
  isAuth,
  channelValidator.listMyVideosQuery,
  isValid,
  channelController.getChannelVideos
);

// GET channels/:username/videos
// Query: ?page=1&limit=20&sort=newest|oldest|popular
// Response: { videos[], pagination }
router.get(
  "/:username/videos",
  channelValidator.usernamePath,
  ...channelValidator.listPublicVideosQuery,
  isValid,
  channelController.getPublicChannelVideos
);

// ========== IN-DEVELOPMENT ============
// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20
// Response: { playlists[], pagination }

// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20 (public only)
// Response: { playlists[], pagination }

// GET channels/me/subscribers
// Headers: Authorization (channel owner only)
// Query: ?page=1&limit=20&sort=newest|oldest
// Response: { subscribers[], pagination }
router.get(
  "/me/subscribers",
  isAuth,
  channelValidator.listSubscribersQuery,
  isValid,
  channelController.getChannelSubscribers
);

// POST channels/:username/subscribe
// Headers: Authorization
// Response: { subscribed: true, subscribers_count }
router.post(
  "/:username/subscribe",
  isAuth,
  channelValidator.usernamePath,
  isValid,
  channelController.subscribeChannel
);

// DELETE channels/:channelId/subscribe
// Headers: Authorization
// Response: { subscribed: false, subscribers_count }
router.delete(
  "/:username/subscribe",
  isAuth,
  channelValidator.usernamePath,
  isValid,
  channelController.unsubscribeChannel
);

export default router;
