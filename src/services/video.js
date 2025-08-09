import { Op, Sequelize } from "sequelize";

import AppError from "../utilities/appError.js";
import { db, sequelize } from "../../database/models/index.js";
import { constants } from "../../config/constants.js";

const { User, Channel, Video, VideoReaction, VideoView, VideoComment, Tag } =
  db;

const { PRIVATE_VIDEO_FIELDS, SHORT_VIDEO_FIELDS } = constants.video;
const { SHORT_CHANNEL_FIELDS } = constants.channel;
const { SHORT_USER_FIELDS } = constants.user;

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

export const createVideoService = async (user, title, description, tags) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  let video;
  const transaction = await sequelize.transaction();
  try {
    video = await channel.createVideo(
      {
        title,
        description: description || null,
        processing_message: "upload your video",
      },
      { transaction }
    );

    const tagPromises = tags.map(async (tagName) => {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
      await tag.increment("use_count", { transaction });
      return tag;
    });
    const createdTags = await Promise.all(tagPromises);
    await video.addTags(createdTags, { transaction });
    video.dataValues.tags = tags;

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  // update it to use env as BASE_URL
  const videoUploadUrl = `https://localhost:3000/upload/video/${video.id}`;
  const thumbnailUploadUrl = `https://localhost:3000/upload/image/${video.id}?type=thumbnail`;

  return {
    video,
    videoUploadUrl,
    thumbnailUploadUrl,
  };
};

export const getPublicVideoService = async (videoId) => {
  const video = await Video.findOne({
    attributes: {
      exclude: PRIVATE_VIDEO_FIELDS,
    },
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
      },
      {
        model: VideoComment,
        as: "comments",
        include: {
          model: User,
          as: "user",
          attributes: SHORT_USER_FIELDS,
        },
        attributes: ["id", "content", "created_at"],
        limit: 10,
      },
    ],
    where: { id: videoId, is_published: true, is_private: false },
  });
  if (!video) throw new AppError("Video not found", 404);

  return { video };
};

export const getVideoService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["name"],
      },
      {
        model: VideoComment,
        as: "comments",
        include: {
          model: User,
          as: "user",
          attributes: SHORT_USER_FIELDS,
        },
        attributes: ["id", "content", "created_at"],
        limit: 10,
      },
    ],
    where: { id: videoId },
    limit: 1,
  });
  if (!video) throw new AppError("Video not found", 404);

  return { video };
};

export const updateVideoService = async (
  user,
  videoId,
  title,
  description,
  is_private
) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  if (title) video.title = title;
  if (description) video.description = description;
  if (is_private !== undefined) video.is_private = is_private;

  await video.save();

  return video;
};

export const deleteVideoService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const transaction = await sequelize.transaction();
  try {
    const [video] = await channel.getVideos({
      where: { id: videoId },
      limit: 1,
      transaction,
    });
    if (!video) throw new AppError("Video not found", 404);

    const tags = await video.getTags({ transaction });
    if (tags.length > 0) {
      await Tag.decrement("use_count", {
        where: { id: tags.map((t) => t.id) },
        transaction,
      });
    }

    await channel.decrement(
      {
        views_count: video.views_count,
        likes_count: video.likes_count,
        dislikes_count: video.dislikes_count,
        comments_count: video.comments_count,
      },
      { transaction }
    );

    // still need to cleanup the associations

    await video.destroy();

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return {
    message: "Video deleted successfully",
  };
};

export const publishVideoService = async (user, videoId, publishAt) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  if (video.is_published) throw new AppError("Video already published", 409);

  if (video.processing_status !== "completed") {
    const processingStatus = video.processing_status;
    const processingMessage = video.processing_message;
    throw new AppError(
      `Video processing not completed yet. Status: ${processingStatus}. Message: ${processingMessage}`,
      409
    );
  }

  if (publishAt && new Date(publishAt) > new Date())
    video.publish_at = publishAt;
  else {
    video.publish_at = new Date();
    video.is_published = true;
  }

  await video.save();

  return video;
};

export const recordVideoViewService = async (user, videoId, watchTime) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const transaction = await sequelize.transaction();
  try {
    const [view, created] = await VideoView.findOrCreate({
      where: { user_id: user.id, video_id: videoId },
      defaults: { watch_time: watchTime },
      transaction,
    });
    if (!created && watchTime > view.watch_time)
      await view.update({ watch_time: watchTime }, { transaction });

    if (created) {
      const channel = video.getChannel();
      await Promise.all([
        video.increment("views_count", { transaction }),
        channel.increment("views_count", { transaction }),
      ]);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return {
    watchedAt: view.watched_at,
    watchTime: view.watch_time,
    viewsCount: video.views_count,
  };
};

export const likeVideoService = async (user, videoId) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const transaction = await sequelize.transaction();
  try {
    const [reaction, created] = await VideoReaction.findOrCreate({
      where: { user_id: user.id, video_id: videoId },
      defaults: { is_like: true },
      transaction,
    });
    if (!created && reaction.is_like) throw new AppError("Already liked", 409);
    if (!created && !reaction.is_like) {
      await Promise.all([
        await reaction.update({ is_like: true }, { transaction }),
        await video.decrement("dislikes_count", { transaction }),
      ]);
    }

    if (created) {
      const channel = video.getChannel();
      await Promise.all([
        video.increment("likes_count", { transaction }),
        channel.increment("likes_count", { transaction }),
      ]);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return {
    is_liked: true,
    likes_count: video.likes_count,
    dislikes_count: video.dislikes_count,
  };
};

export const dislikeVideoService = async (user, videoId) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const transaction = await sequelize.transaction();
  try {
    const [reaction, created] = await VideoReaction.findOrCreate({
      where: { user_id: user.id, video_id: videoId },
      defaults: { is_like: false },
      transaction,
    });
    if (!created && !reaction.is_like)
      throw new AppError("Already disliked", 409);
    if (!created && reaction.is_like) {
      await Promise.all([
        await reaction.update({ is_like: false }, { transaction }),
        await video.decrement("likes_count", { transaction }),
      ]);
    }

    if (created) {
      const channel = video.getChannel();
      await Promise.all([
        video.increment("dislikes_count", { transaction }),
        channel.increment("dislikes_count", { transaction }),
      ]);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return {
    is_liked: false,
    likes_count: video.likes_count,
    dislikes_count: video.dislikes_count,
  };
};

export const removeVideoReactionService = async (user, videoId) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const [reaction] = await video.getReactions({
    where: { user_id: user.id },
  });
  if (!reaction) throw new AppError("No reaction found", 404);

  const transaction = await sequelize.transaction();
  try {
    const channel = await video.getChannel();

    if (reaction.is_like) {
      await Promise.all([
        video.decrement("likes_count", { transaction }),
        channel.decrement("likes_count", { transaction }),
      ]);
    } else {
      await Promise.all([
        video.decrement("dislikes_count", { transaction }),
        channel.decrement("dislikes_count", { transaction }),
      ]);
    }

    await reaction.destroy({ transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return {
    is_liked: null,
    likes_count: video.likes_count,
    dislikes_count: video.dislikes_count,
  };
};

export const getVideoReactionsService = async (
  user,
  videoId,
  inPage,
  inLimit,
  sort,
  type
) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const channel = await user.getChannel();
  if (video.channel_id !== channel.id)
    throw new AppError("Unauthorized to view reactions", 401);

  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest" ? [["created_at", "DESC"]] : [["created_at", "ASC"]];

  const where = type ? { is_like: type === "like" } : {};

  const [[reactions], total] = await Promise.all([
    video.getReactions({
      where,
      include: {
        model: User,
        as: "user",
        attributes: SHORT_USER_FIELDS,
      },
      order,
      limit,
      offset,
    }),

    video.getReactions({ where }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    reactions,
    pagination,
  };
};

export const getPublicVideoCommentsService = async (
  videoId,
  inPage,
  inLimit,
  sort,
  parentCommentId
) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest" ? [["created_at", "DESC"]] : [["created_at", "ASC"]];

  const [comments, total] = await Promise.all([
    VideoComment.findAll({
      where: { video_id: videoId, parent_comment_id: parentCommentId || null },
      include: {
        model: User,
        as: "user",
        attributes: SHORT_USER_FIELDS,
      },
      order,
      limit,
      offset,
    }),

    VideoComment.findAll({
      where: { video_id: videoId, parent_comment_id: parentCommentId || null },
    }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    comments,
    pagination,
  };
};

export const createVideoCommentService = async (
  user,
  videoId,
  content,
  parentCommentId
) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  let comment;
  const transaction = await sequelize.transaction();
  try {
    if (parentCommentId) {
      const parentComment = await VideoComment.findByPk(parentCommentId, {
        transaction,
      });
      if (!parentComment) throw new AppError("Parent comment not found", 404);

      if (parentComment.video_id !== videoId)
        throw new AppError("Parent comment not found", 404);

      await parentComment.increment("child_comments_count", { transaction });
    }

    const channel = await video.getChannel();
    [comment] = await Promise.all([
      user.createVideoComment(
        {
          video_id: videoId,
          parent_comment_id: parentCommentId || null,
          content,
        },
        { transaction }
      ),
      video.increment("comments_count", { transaction }),
      channel.increment("comments_count", { transaction }),
    ]);

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return { comment };
};
