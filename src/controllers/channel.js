import * as channelServer from "../services/channel.js";

// POST /api/channels
// Headers: Authorization
// Body: { username, name, description, avatar?, banner? }
// Response: { channel }
export const createChannel = async (req, res) => {
  const user = req.user;
  const { username, name, description, avatar, banner } = req.body;
  const data = await channelServer.createChannelService(
    user,
    username,
    name,
    description,
    avatar,
    banner
  );
  res.jsend.success(data, 201);
};

// GET /api/channels/me
// Authorization: Bearer token
// Response: { channel with stats, recent videos }
export const getChannel = async (req, res) => {
  const user = req.user;
  const data = await channelServer.getChannelService(user);
  res.jsend.success(data);
};

// GET /api/channels/:username
// Response: { channel with stats, recent videos }
export const getPublicChannel = async (req, res) => {
  const { username } = req.params;
  const data = await channelServer.getPublicChannelService(username);
  res.jsend.success(data);
};

// PUT /api/channels/me
// Headers: Authorization (channel owner)
// Body: { name?, description?, avatar?, banner? }
// Response: { channel }
export const updateChannel = async (req, res) => {
  const user = req.user;
  const { name, username, description, avatar, banner } = req.body;
  const data = await channelServer.updateChannelService(
    user,
    name,
    username,
    description,
    avatar,
    banner
  );
  res.jsend.success(data);
};

// DELETE /api/channels/me
// Headers: Authorization (channel owner)
// Response: { message: "Channel deleted" }
export const deleteChannel = async (req, res) => {
  const user = req.user;
  const data = await channelServer.deleteChannelService(user);
  res.jsend.success(data);
};

// GET /api/channels/me/videos
// Authorization: Bearer token
// Query: ?page=1&limit=20&sort=newest|oldest|popular&privateOnly=true|false&unpublishedOnly=true|false
// Response: { videos[], pagination }
export const getChannelVideos = async (req, res) => {
  const user = req.user;
  const { page, limit, sort, privateOnly, unpublishedOnly } = req.query;
  const data = await channelServer.getChannelVideosService(
    user,
    page,
    limit,
    sort,
    privateOnly,
    unpublishedOnly
  );
  res.jsend.success(data);
};

// GET /api/channels/:channelId/videos
// Query: ?page=1&limit=20&sort=newest|oldest|popular
// Response: { videos[], pagination }
export const getPublicChannelVideos = async (req, res) => {
  const { username } = req.params;
  const { page, limit, sort } = req.query;
  const data = await channelServer.getPublicChannelVideosService(
    username,
    page,
    limit,
    sort
  );
  res.jsend.success(data);
};

// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20
// Response: { playlists[], pagination }

// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20 (public only)
// Response: { playlists[], pagination }

// GET /api/channels/me/subscribers
// Headers: Authorization (channel owner only)
// Query: ?page=1&limit=20&sort=newest|oldest
// Response: { subscribers[], pagination }
export const getChannelSubscribers = async (req, res) => {
  const user = req.user;
  const { page, limit, sort } = req.query;
  const data = await channelServer.getChannelSubscribersService(
    user,
    page,
    limit,
    sort
  );
  res.jsend.success(data);
};

// POST /api/channels/:channelId/subscribe
// Headers: Authorization
// Response: { subscribed: true, subscribers_count }

// DELETE /api/channels/:channelId/subscribe
// Headers: Authorization
// Response: { subscribed: false, subscribers_count }
