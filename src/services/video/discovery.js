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
      ? [["publish_at", "DESC"]]
      : sort === "oldest"
      ? [["publish_at", "ASC"]]
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

export const getTrendingPublicVideosService = async (
  inPage,
  inLimit,
  timeframe
) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;

  const X_DAYS = timeframe === "week" ? 7 : timeframe === "month" ? 30 : 1;

  const recentViewsCutoff = new Date(
    Date.now() - X_DAYS * 60 * 60 * 1000
  ).toISOString();

  /* 
  Formula that i use is:
  Trending Score = 
  (Views in last X hours) / (Age of video in hours)
  + Engagement Factor (likes*2 + dislikes*0.5 + comments*1.5)
  */
  const videos = await Video.findAll({
    attributes: {
      include: [
        // Recent Views in X DAYS
        [
          Sequelize.literal(`(
              SELECT COUNT(*)
              FROM video_views AS vv
              WHERE vv.video_id = "Video".id 
              AND vv.watched_at >= TIMESTAMPTZ '${recentViewsCutoff}'
          )`),
          "recent_views",
        ],
        // Video Age in Hours
        [
          Sequelize.literal(
            `GREATEST(EXTRACT(EPOCH FROM (NOW() - "Video"."publish_at")) / 3600, 0.1)`
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
                AND vv.watched_at >= TIMESTAMPTZ '${recentViewsCutoff}'
              ) / GREATEST(EXTRACT(EPOCH FROM (NOW() - "Video"."publish_at")) / 3600, 0.1)
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
        attributes: SHORT_CHANNEL_FIELDS,
      },
    ],
    where: {
      is_published: true,
      is_private: false,
      // Only videos from last month => (max)
      publish_at: {
        [Sequelize.Op.gte]: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    },
    order: [["trending_score", "DESC"]],
    limit,
    offset,
  });
  const total = await Video.count({
    where: {
      is_published: true,
      is_private: false,
      publish_at: {
        [Sequelize.Op.gte]: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      },
    },
  });

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
      ? [["publish_at", "DESC"]]
      : sort === "oldest"
      ? [["publish_at", "ASC"]]
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

  console.log(tags);

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
