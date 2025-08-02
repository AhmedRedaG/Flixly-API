import { db } from "../../database/models/index.js";
import AppError from "../utilities/appError.js";

const { Channel } = db;

// POST /api/channels
// Headers: Authorization
// Body: { username, name, description, avatar?, banner? }
// Response: { channel }
export const createChannelService = async (
  user,
  username,
  name,
  description,
  avatar,
  banner
) => {
  const channelExisted = await user.getChannel();
  if (channelExisted) throw new AppError("User already has a channel", 409);

  const usernameExisted = await Channel.findOne({ where: { username } });
  if (usernameExisted) throw new AppError("Username already exists", 409);

  const channelData = await user.createChannel({
    username,
    name,
    description,
    avatar,
    banner,
  });
  const { id, user_id, ...channel } = channelData.toJSON();

  return {
    channel,
  };
};

// GET /api/channels/:channelId
// Response: { channel with stats, recent videos }

// GET /api/channels/username/:username
// Response: { channel with stats, recent videos }

// PUT /api/channels/:channelId
// Headers: Authorization (channel owner)
// Body: { name?, description?, avatar?, banner? }
// Response: { channel }

// DELETE /api/channels/:channelId
// Headers: Authorization (channel owner)
// Response: { message: "Channel deleted" }

// GET /api/channels/:channelId/videos
// Query: ?page=1&limit=20&sort=newest|oldest|popular
// Response: { videos[], pagination }

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
