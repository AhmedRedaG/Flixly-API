import * as channelServer from "../services/channel.js";

export const createChannel = async (req, res) => {
  const user = req.user;
  const { username, name, description } = req.body;
  const data = await channelServer.createChannelService(
    user,
    username,
    name,
    description
  );
  res.jsend.success(data, 201);
};

export const getChannel = async (req, res) => {
  const user = req.user;
  const data = await channelServer.getChannelService(user);
  res.jsend.success(data);
};

export const getPublicChannel = async (req, res) => {
  const { username } = req.params;
  const data = await channelServer.getPublicChannelService(username);
  res.jsend.success(data);
};

export const updateChannel = async (req, res) => {
  const user = req.user;
  const { name, description } = req.body;
  const data = await channelServer.updateChannelService(
    user,
    name,
    description
  );
  res.jsend.success(data);
};

export const deleteChannel = async (req, res) => {
  const user = req.user;
  const data = await channelServer.deleteChannelService(user);
  res.jsend.success(data);
};

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

// ============ IN-DEVELOPMENT ==============
// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20
// Response: { playlists[], pagination }

// GET /api/channels/:channelId/playlists
// Query: ?page=1&limit=20 (public only)
// Response: { playlists[], pagination }

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

export const subscribeChannel = async (req, res, next) => {
  const user = req.user;
  const { username } = req.params;
  const data = await channelServer.subscribeChannelService(user, username);
  res.jsend.success(data);
};

export const unsubscribeChannel = async (req, res) => {
  const user = req.user;
  const { username } = req.params;
  const data = await channelServer.unsubscribeChannelService(user, username);
  res.jsend.success(data);
};
