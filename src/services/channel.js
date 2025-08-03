import { db } from "../../database/models/index.js";
import AppError from "../utilities/appError.js";

const { Channel, Video } = db;

const publicVideoFields = [
  "id",
  "title",
  "description",
  "url",
  "thumbnail",
  "views_count",
  "likes_count",
  "dislikes_count",
  "comments_count",
  "duration",
  "publish_at",
];

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

// GET /api/channels/me
// Authorization: Bearer token
// Response: { channel with stats, recent videos }
export const getChannelService = async (user) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const recentVideos = await channel.getVideos({
    attributes: { exclude: ["channel_id"] },
    order: [["created_at", "DESC"]],
    limit: 10,
    raw: true,
  });

  const { id, user_id, ...channelData } = channel.toJSON();

  return {
    channel: {
      ...channelData,
      recentVideos,
    },
  };
};

// GET /api/channels/:username
// Response: { channel with stats, recent videos }
export const getPublicChannelService = async (username) => {
  const channel = await Channel.findOne({ where: { username } });
  if (!channel) throw new AppError("Channel not found", 404);

  const recentVideos = await channel.getVideos({
    attributes: publicVideoFields,
    where: { is_published: true, is_private: false },
    order: [["created_at", "DESC"]],
    limit: 10,
    raw: true,
  });

  const { id, user_id, ...channelData } = channel.toJSON();

  return {
    channel: {
      ...channelData,
      recentVideos,
    },
  };
};

// PUT /api/channels/me
// Headers: Authorization (channel owner)
// Body: { name?, description?, avatar?, banner? }
// Response: { channel }
export const updateChannelService = async (
  user,
  name,
  description,
  avatar,
  banner
) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  if (name) channel.name = name;
  if (description) channel.description = description;
  if (avatar) channel.avatar = avatar;
  if (banner) channel.banner = banner;

  await channel.save();

  const { id, user_id, ...channelData } = channel.toJSON();

  return {
    channel: channelData,
  };
};

// DELETE /api/channels/:username
// Headers: Authorization (channel owner)
// Response: { message: "Channel deleted" }
export const deleteChannelService = async (user) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  await channel.destroy();

  return {
    message: "Channel deleted successfully",
  };
};

// GET /api/channels/me/videos
// Authorization: Bearer token
// Query: ?page=1&limit=20&sort=newest|oldest|popular&privateOnly=true|false&unpublishedOnly=true|false
// Response: { videos[], pagination }
export const getChannelVideosService = async (
  user,
  inPage,
  inLimit,
  sort,
  privateOnly,
  unpublishedOnly
) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest"
      ? [["created_at", "DESC"]]
      : sort === "oldest"
      ? [["created_at", "ASC"]]
      : [["views_count", "DESC"]];
  const where = privateOnly
    ? { is_private: true }
    : unpublishedOnly
    ? { is_published: false }
    : {};

  const videos = await channel.getVideos({
    attributes: { exclude: ["channel_id"] },
    where,
    order,
    limit,
    offset,
    raw: true,
  });
  const total = videos?.length || 0;

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    videos,
    pagination,
  };
};

// GET /api/channels/:username/videos
// Query: ?page=1&limit=20&sort=newest|oldest|popular
// Response: { videos[], pagination }
export const getPublicChannelVideosService = async (
  username,
  inPage,
  inLimit,
  sort
) => {
  const channel = await Channel.findOne({ where: { username } });
  if (!channel) throw new AppError("Channel not found", 404);

  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest"
      ? [["created_at", "DESC"]]
      : sort === "oldest"
      ? [["created_at", "ASC"]]
      : [["views_count", "DESC"]];

  const videos = await channel.getVideos({
    attributes: publicVideoFields,
    where: { is_published: true, is_private: false },
    order,
    limit,
    offset,
    raw: true,
  });
  const total = videos?.length || 0;

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    videos,
    pagination,
  };
};

// GET /api/channels/:username/playlists
// Query: ?page=1&limit=20
// Response: { playlists[], pagination }

// GET /api/channels/:username/playlists
// Query: ?page=1&limit=20 (public only)
// Response: { playlists[], pagination }

// GET /api/channels/me/subscribers
// Headers: Authorization (channel owner only)
// Query: ?page=1&limit=20
// Response: { subscribers[], pagination }

// POST /api/channels/:username/subscribe
// Headers: Authorization
// Response: { subscribed: true, subscribers_count }

// DELETE /api/channels/:username/subscribe
// Headers: Authorization
// Response: { subscribed: false, subscribers_count }
