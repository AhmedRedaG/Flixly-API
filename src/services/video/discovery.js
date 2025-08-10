import { Op, Sequelize } from "sequelize";

import { db } from "../../../database/models/index.js";
import { constants } from "../../../config/constants.js";

const { Channel, Video, Tag } = db;
const { SHORT_VIDEO_FIELDS } = constants.video;
const { SHORT_CHANNEL_FIELDS } = constants.channel;

export const getMainPublicVideosService = async (inPage, inLimit, sort) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest"
      ? [["created_at", "DESC"]]
      : sort === "oldest"
      ? [["created_at", "ASC"]]
      : [["views_count", "DESC"]];
  const where = { is_published: true, is_private: false };

  const [videos, total] = await Promise.all([
    Video.findAll({
      attributes: SHORT_VIDEO_FIELDS,
      include: {
        model: Channel,
        as: "channel",
        attributes: SHORT_CHANNEL_FIELDS,
      },
      where,
      order,
      limit,
      offset,
    }),

    Video.count({ where }),
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

// ================ not working yet ================
// GET /api/videos/trending
// Query: ?page=1&limit=20&timeframe=day|week|month
// Response: { videos[], pagination }
export const getTrendingPublicVideosService = async (
  inPage,
  inLimit,
  timeframe
) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;

  const X_HOURS =
    timeframe === "day"
      ? 24
      : timeframe === "week"
      ? 24 * 7
      : timeframe === "month"
      ? 24 * 30
      : 24;

  /* 
  Formula that i use is:
  Trending Score = 
  (Views in last X hours) / (Age of video in hours)
  + Engagement Factor (likes*2 + dislikes*0.5 + comments*1.5)
  */
  const videos = await Video.findAll({
    attributes: {
      include: [
        // Recent Views in X Hours
        [
          Sequelize.literal(`(
              SELECT COUNT(*)
              FROM video_views AS vv
              WHERE vv.video_id = "Video".id 
              AND vv.created_at >= NOW() - INTERVAL ? HOUR
          )`),
          "recent_views",
        ],
        // Video Age in Hours
        [
          Sequelize.literal(
            `GREATEST(EXTRACT(EPOCH FROM (NOW() - "Video"."created_at")) / 3600, 0.1)`
          ),
          "video_age_hours",
        ],
        // Calculate trending score
        [
          Sequelize.literal(`(
              (
                SELECT COUNT(*)
                FROM video_views AS vv
                WHERE vv.video_id = "Video".id 
                AND vv.created_at >= NOW() - INTERVAL ? HOUR
              ) / GREATEST(EXTRACT(EPOCH FROM (NOW() - "Video"."created_at")) / 3600, 0.1)
            ) + ("Video"."likes_count" * 2)
              + ("Video"."dislikes_count" * 0.5)
              + ("Video"."comments_count" * 1.5)
          `),
          "trending_score",
        ],
      ],
    },
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["username", "name", "avatar"],
      },
    ],
    where: {
      is_published: true,
      is_private: false,
      // Only videos from last month
      created_at: {
        [Sequelize.Op.gte]: Sequelize.literal(`NOW() - INTERVAL '30 DAY'`),
      },
    },
    order: [["trending_score", "DESC"]],
    limit,
    offset,
    bind: [X_HOURS, X_HOURS],
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

export const searchPublicVideosService = async (
  search,
  inPage,
  inLimit,
  sort,
  tags
) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest"
      ? [["created_at", "DESC"]]
      : sort === "oldest"
      ? [["created_at", "ASC"]]
      : sort === "popular"
      ? [["views_count", "DESC"]]
      : []; // relevance

  const where = {
    [Op.and]: [
      { is_published: true },
      { is_private: false },
      {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      },
    ],
  };

  const tagCondition = tags ? { name: { [Op.in]: tags } } : {};

  const [videos, total] = await Promise.all([
    Video.findAll({
      attributes: SHORT_VIDEO_FIELDS,
      include: [
        {
          model: Channel,
          as: "channel",
          attributes: SHORT_CHANNEL_FIELDS,
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["name"],
          where: tagCondition,
        },
      ],
      where,
      order,
      limit,
      offset,
    }),

    Video.count({
      include: {
        model: Tag,
        as: "tags",
        where: tagCondition,
      },
      where,
    }),
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
