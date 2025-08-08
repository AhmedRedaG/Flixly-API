import { Op, Sequelize } from "sequelize";

import AppError from "../utilities/appError.js";
import { db } from "../../database/models/index.js";

const {
  User,
  RefreshToken,
  ResetToken,
  Channel,
  Playlist,
  Video,
  Subscription,
  VideoReaction,
  VideoView,
  VideoComment,
  Report,
  Tag,
} = db;

const publicVideoFields = [
  "id",
  "title",
  "description",
  "url",
  "thumbnail",
  "views_count",
  "likes_count",
  "dislikes_count",
  "comments_count",
  "duration",
  "publish_at",
];

/**
 * VIDEO DISCOVERY & SEARCH
 */
// GET /api/videos
// Query: ?page=1&limit=20&sort=newest|popular&tags=?&search=?
// Response: { videos[], pagination, filters }
export const getMainPublicVideosService = async (
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
      : [["views_count", "DESC"]];
  const where = { is_published: true, is_private: false };

  const tagCondition = tags ? { name: { [Op.in]: tags } } : {};

  const videos = await Video.findAll({
    attributes: ["id", "title", "thumbnail", "views_count"],
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["username", "name", "avatar"],
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

// GET /api/videos/search
// Query: ?q=search_term&page=1&limit=20&sort=relevance|newest|oldest/popular
// Response: { videos[], pagination }
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

  const videos = await Video.findAll({
    attributes: ["id", "title", "description", "thumbnail", "views_count"],
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["username", "name", "avatar"],
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

/**
 * VIDEO CRUD
 */
// POST /api/videos
// Headers: Authorization
// Body: { title, description?, tags[] }
// Response: { video, upload_url? }
export const createVideoService = async (user, title, description, tags) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const video = await channel.createVideo({
    title,
    description,
  });

  for (const tagName of tags) {
    const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
    await tag.increment("use_count");
    await video.addTag(tag);
  }
  video.dataValues.tags = tags;
  // await promise.all(tags.map((tag) => {}));
  // await video.createTags(tags); // need to implement

  const videoUploadUrl = `https://localhost:3000/upload/video/${video.id}`;
  const thumbnailUploadUrl = `https://localhost:3000/upload/image/${video.id}?type=thumbnail`;

  return {
    // video: {
    //   ...video.dataValues,
    //   tags,
    // },
    video,
    videoUploadUrl,
    thumbnailUploadUrl,
  };
};

// GET /api/videos/:videoId
// Response: { video with channel, tags, comments?, view_count }
export const getPublicVideoService = async (videoId) => {
  const video = await Video.findOne({
    where: { id: videoId, is_published: true, is_private: false },
    include: [
      {
        model: Channel,
        as: "channel",
        attributes: ["username", "name", "avatar"],
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
          attributes: ["username", "firstName", "lastName", "avatar"],
        },
        attributes: ["id", "content", "created_at"],
        limit: 10,
        raw: true,
      },
    ],
    attributes: publicVideoFields,
  });
  if (!video) throw new AppError("Video not found", 404);

  return video;
};

// GET /api/videos/:videoId
// Authorization: Bearer token
// Response: { video with channel, tags, comments?, view_count }
export const getVideoService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const video = await channel.getVideos({
    where: { id: videoId },
    include: [
      {
        model: Tag,
        as: "tags",
        attributes: ["name"],
      },
    ],
  });
  if (!video) throw new AppError("Video not found", 404);

  return { video };
};

// PUT /api/videos/:videoId
// Headers: Authorization (video owner)
// Body: { title?, description?, is_private?, tags[] }
// Response: { video }
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

// DELETE /api/videos/:videoId
// Headers: Authorization (video owner)
// Response: { message: "Video deleted" }
export const deleteVideoService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  const tags = await video.getTags();
  await Promise.all(tags.map((tag) => tag.decrement("use_count")));

  await video.destroy();

  return {
    message: "Video deleted successfully",
  };
};

// PATCH /api/videos/:videoId/publish
// Headers: Authorization (video owner)
// Body: { publish_at? } // null = publish now
// Response: { video }
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

/**
 * VIDEO INTERACTIONS
 */
// POST /api/videos/:videoId/view
// Headers: Authorization
// Body: { watch_time } // seconds watched
// Response: { message: "View recorded" }
export const recordVideoViewService = async (user, videoId, watchTime) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const [view, created] = await VideoView.findOrCreate({
    where: { user_id: user.id, video_id: videoId },
    defaults: { watch_time: watchTime },
  });
  if (!created && watchTime > view.watch_time)
    await view.update({ watch_time: watchTime });

  if (created) await video.increment("views_count");

  return {
    watchedAt: view.watched_at,
    watchTime: view.watch_time,
    viewsCount: video.views_count,
  };
};

// POST /api/videos/:videoId/like
// Headers: Authorization
// Response: { is_liked: true, likes_count, dislikes_count }
export const likeVideoService = async (user, videoId) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const [reaction, created] = await VideoReaction.findOrCreate({
    where: { user_id: user.id, video_id: videoId },
    defaults: { is_like: true },
  });
  if (!created && reaction.is_like) throw new AppError("Already liked", 409);
  if (!created && !reaction.is_like) {
    await reaction.update({ is_like: true });
    video.dislikes_count--;
  }

  video.likes_count++;
  await video.save();

  return {
    is_liked: true,
    likes_count: video.likes_count,
    dislikes_count: video.dislikes_count,
  };
};

// POST /api/videos/:videoId/dislike
// Headers: Authorization
// Response: { is_liked: false, likes_count, dislikes_count }
export const dislikeVideoService = async (user, videoId) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const [reaction, created] = await VideoReaction.findOrCreate({
    where: { user_id: user.id, video_id: videoId },
    defaults: { is_like: false },
  });
  if (!created && !reaction.is_like)
    throw new AppError("Already disliked", 409);
  if (!created && reaction.is_like) {
    await reaction.update({ is_like: false });
    video.likes_count--;
  }

  video.dislikes_count++;
  await video.save();

  return {
    is_liked: false,
    likes_count: video.likes_count,
    dislikes_count: video.dislikes_count,
  };
};

// DELETE /api/videos/:videoId/reaction
// Headers: Authorization
// Response: { likes_count, dislikes_count }
export const removeVideoReactionService = async (user, videoId) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  const [reaction] = await video.getReactions({
    where: { user_id: user.id },
  });

  if (!reaction) throw new AppError("No reaction found", 404);

  if (reaction.is_like) video.likes_count--;
  else video.dislikes_count--;

  await video.save();
  await reaction.destroy();

  return {
    is_liked: null,
    likes_count: video.likes_count,
    dislikes_count: video.dislikes_count,
  };
};

// GET /api/videos/:videoId/reactions
// Headers: Authorization (video owner only)
// Query: ?page=1&limit=20&type=like|dislike
// Response: { reactions[], pagination }
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

  const [reactions] = await video.getReactions({
    where,
    include: {
      model: User,
      as: "user",
      attributes: ["username", "firstName", "lastName", "avatar"],
    },
    order,
    limit,
    offset,
  });
  const total = video.likes_count + video.dislikes_count;

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

// GET /api/videos/:videoId/comments
// Query: ?page=1&limit=20&sort=newest|oldest&parent_id=?
// Response: { comments[], pagination }
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

  const comments = await VideoComment.findAll({
    where: { video_id: videoId, parent_comment_id: parentCommentId || null },
    include: {
      model: User,
      as: "user",
      attributes: ["username", "firstName", "lastName", "avatar"],
    },
    order,
    limit,
    offset,
  });
  const total = video.total_comments;

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

// POST /api/videos/:videoId/comments
// Headers: Authorization
// Body: { content, parent_comment_id? }
// Response: { comment }
export const createVideoCommentService = async (
  user,
  videoId,
  content,
  parentCommentId
) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  if (parentCommentId) {
    const parentComment = await VideoComment.findByPk(parentCommentId);
    if (!parentComment) throw new AppError("Parent comment not found", 404);
  }

  const comment = await user.createVideoComment({
    video_id: videoId,
    parent_comment_id: parentCommentId || null,
    content,
  });
  await video.increment("comments_count");

  return { comment };
};
