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

// POST /api/tags
// Headers: Authorization (admin only)
// Body: { name }
// Response: { tag }
