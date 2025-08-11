import { Op } from "sequelize";

import { db } from "../../database/models/index.js";
import AppError from "../utilities/appError.js";
import { constants } from "../../config/constants.js";

const { SHORT_VIDEO_FIELDS } = constants.video;
const { Tag } = db;

export const getTagsService = async (search, inPage, inLimit, popular) => {
  const page = inPage || 1;
  const limit = inLimit || 20;
  const offset = (page - 1) * limit;
  const order = popular ? [["use_count", "DESC"]] : [["name", "ASC"]];
  const where = search ? { name: { [Op.iLike]: `%${search}%` } } : {};

  const [tags, total] = await Promise.all([
    Tag.findAll({ where, order, limit, offset }),
    Tag.count({ where }),
  ]);

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

export const getTagVideosService = async (tagId, inPage, inLimit, sort) => {
  const tag = await Tag.findByPk(tagId);
  if (!tag) throw new AppError("Tag not found", 404);

  const page = inPage || 1;
  const limit = inLimit || 20;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest"
      ? [["created_at", "DESC"]]
      : sort === "oldest"
      ? [["created_at", "ASC"]]
      : [["views_count", "DESC"]];

  const [videos, total] = await Promise.all([
    tag.getVideos({
      attributes: SHORT_VIDEO_FIELDS,
      where: { is_published: true, is_private: false },
      order,
      limit,
      offset,
    }),
    tag.countVideos({ where: { is_published: true, is_private: false } }),
  ]);

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

export const deleteTagService = async (user, tagId) => {
  if (user.role !== "admin") throw new AppError("Cannot delete tag", 403);

  const tag = await Tag.findByPk(tagId);
  if (!tag) throw new AppError("Tag not found", 404);

  await tag.destroy();

  return {
    message: "Tag deleted successfully",
  };
};
