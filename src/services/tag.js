import { Op } from "sequelize";

import { db } from "../../database/models/index.js";

const { Tag } = db;

// GET /api/tags
// Query: ?search=?&limit=20&popular=true
// Response: { tags[] }
export const getTagsService = async (search, inPage, inLimit, popular) => {
  const page = inPage || 1;
  const limit = inLimit || 20;
  const offset = (page - 1) * limit;
  const order = popular ? [["use_count", "DESC"]] : [["name", "ASC"]];
  const where = search ? { name: { [Op.iLike]: `%${search}%` } } : {};

  const tags = await Tag.findAll({ where, order, limit, offset });
  const total = tags?.length || 0;

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    tags,
    pagination,
  };
};

// GET /api/tags/:tagId/videos
// Query: ?page=1&limit=20&sort=newest|popular
// Response: { videos[], pagination }

// POST /api/tags
// Headers: Authorization (admin only)
// Body: { name }
// Response: { tag }
