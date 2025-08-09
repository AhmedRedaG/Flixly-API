import * as videoServer from "../services/video.js";

export const getMainPublicVideos = async (req, res) => {
  const { page, limit, sort } = req.query;
  const data = await videoServer.getMainPublicVideosService(page, limit, sort);
  res.jsend.success(data);
};

export const getTrendingPublicVideos = async (req, res) => {
  const { page, limit, timeframe } = req.query;
  const data = await videoServer.getTrendingPublicVideosService(
    page,
    limit,
    timeframe
  );
  res.jsend.success(data);
};

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

export const getPublicVideo = async (req, res) => {
  const { videoId } = req.params;
  const data = await videoServer.getPublicVideoService(videoId);
  res.jsend.success(data);
};

export const getVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await videoServer.getVideoService(user, videoId);
  res.jsend.success(data);
};

export const updateVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { title, description, is_private } = req.body;
  const data = await videoServer.updateVideoService(
    user,
    videoId,
    title,
    description,
    is_private
  );
  res.jsend.success(data);
};

export const deleteVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await videoServer.deleteVideoService(user, videoId);
  res.jsend.success(data);
};

export const publishVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { publishAt } = req.body;
  const data = await videoServer.publishVideoService(user, videoId, publishAt);
  res.jsend.success(data);
};

export const recordVideoView = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { watchTime } = req.body;
  const data = await videoServer.recordVideoViewService(
    user,
    videoId,
    watchTime
  );
  res.jsend.success(data);
};

export const likeVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await videoServer.likeVideoService(user, videoId);
  res.jsend.success(data);
};

export const dislikeVideo = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await videoServer.dislikeVideoService(user, videoId);
  res.jsend.success(data);
};

export const removeVideoReaction = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const data = await videoServer.removeVideoReactionService(user, videoId);
  res.jsend.success(data);
};

export const getVideoReactions = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { page, limit, sort, type } = req.query;
  const data = await videoServer.getVideoReactionsService(
    user,
    videoId,
    page,
    limit,
    sort,
    type
  );
  res.jsend.success(data);
};

export const getPublicVideoComments = async (req, res) => {
  const { videoId } = req.params;
  const { page, limit, sort, parentCommentId } = req.query;
  const data = await videoServer.getPublicVideoCommentsService(
    videoId,
    page,
    limit,
    sort,
    parentCommentId
  );
  res.jsend.success(data);
};

export const createVideoComment = async (req, res) => {
  const user = req.user;
  const { videoId } = req.params;
  const { content, parentCommentId } = req.body;
  const data = await videoServer.createVideoCommentService(
    user,
    videoId,
    content,
    parentCommentId
  );
  res.jsend.success(data, 201);
};
