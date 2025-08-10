import * as tagServer from "../services/tag.js";

export const getTags = async (req, res) => {
  const { search, page, limit, popular } = req.query;
  const data = await tagServer.getTagsService(search, page, limit, popular);
  res.jsend.success(data);
};

export const getTagVideos = async (req, res) => {
  const { tagId } = req.params;
  const { page, limit, sort } = req.query;
  const data = await tagServer.getTagVideosService(tagId, page, limit, sort);
  res.jsend.success(data);
};

export const deleteTag = async (req, res) => {
  const user = req.user;
  const { tagId } = req.params;
  const data = await tagServer.deleteTagService(user, tagId);
  res.jsend.success(data);
};
