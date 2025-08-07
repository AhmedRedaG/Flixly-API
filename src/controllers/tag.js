import * as tagServer from "../services/tag.js";

// GET /api/tags
// Query: ?search=?&limit=20&popular=true
// Response: { tags[] }
export const getTags = async (req, res) => {
  const { search, page, limit, popular } = req.query;
  const data = await tagServer.getTagsService(search, limit, popular);
  res.jsend.success(data);
};

// GET /api/tags/:tagId/videos
// Query: ?page=1&limit=20&sort=newest|popular
// Response: { videos[], pagination }
export const getTagVideos = async (req, res) => {
  const { tagId } = req.params;
  const { page, limit, sort } = req.query;
  const data = await tagServer.getTagVideosService(tagId, page, limit, sort);
  res.jsend.success(data);
};

// DELETE /api/tags/:tagId
// Headers: Authorization (admin only)
// Response: { message: "Tag deleted" }
export const deleteTag = async (req, res) => {
  const user = req.user;
  const { tagId } = req.params;
  const data = await tagServer.deleteTagService(user, tagId);
  res.jsend.success(data);
};
