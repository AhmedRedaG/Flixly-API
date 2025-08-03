import { Router } from "express";

import * as channelController from "../controllers/channel.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

// POST /api/channels/me
// Headers: Authorization
// Body: { username, name, description, avatar?, banner? }
// Response: { channel }
router.post("/me", isAuth, channelController.createChannel);

// GET /api/channels/me
// Authorization: Bearer token
// Response: { channel with stats, recent videos }
router.get("/me", isAuth, channelController.getChannel);

// GET /api/channels/:username
// Response: { channel with stats, recent videos }
router.get("/:username", channelController.getPublicChannel);

// PUT /api/channels/me
// Headers: Authorization (channel owner)
// Body: { name?, description?, avatar?, banner? }
// Response: { channel }
router.put("/me", isAuth, channelController.updateChannel);

// DELETE /api/channels/me
// Headers: Authorization (channel owner)
// Response: { message: "Channel deleted" }
router.delete("/me", isAuth, channelController.deleteChannel);

// GET /api/channels/:channelId/videos
// Query: ?page=1&limit=20&sort=newest|oldest|popular
// Response: { videos[], pagination }
router.get("/:username/videos", channelController.getPublicChannelVideos);

// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20
// Response: { playlists[], pagination }

// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20 (public only)
// Response: { playlists[], pagination }

// GET /api/channels/:channelId/subscribers
// Headers: Authorization (channel owner only)
// Query: ?page=1&limit=20
// Response: { subscribers[], pagination }

// POST /api/channels/:channelId/subscribe
// Headers: Authorization
// Response: { subscribed: true, subscribers_count }

// DELETE /api/channels/:channelId/subscribe
// Headers: Authorization
// Response: { subscribed: false, subscribers_count }

export default router;
