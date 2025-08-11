import AppError from "../../utilities/appError.js";
import { db, sequelize } from "../../../database/models/index.js";
import { constants } from "../../../config/constants.js";

const { User, Video, VideoReaction, VideoView, VideoComment } = db;
const { SHORT_USER_FIELDS } = constants.user;

export const recordVideoViewService = async (user, videoId, watchTime) => {
  const video = await Video.findByPk(videoId);
  if (!video) throw new AppError("Video not found", 404);

  if (video.is_privet || !video.is_published)
    throw new AppError("Video is privet or not published yet", 401);

  let view, created;
  const transaction = await sequelize.transaction();
  try {
    [view, created] = await VideoView.findOrCreate({
      where: { user_id: user.id, video_id: videoId },
      defaults: { watch_time: watchTime },
      transaction,
    });
    if (!created && watchTime > view.watch_time)
      await view.update({ watch_time: watchTime }, { transaction });

    if (created) {
      const channel = await video.getChannel();
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

  if (video.is_privet || !video.is_published)
    throw new AppError("Video is privet or not published yet", 401);

  const channel = await video.getChannel();

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
        await channel.decrement("dislikes_count", { transaction }),
      ]);
    }

    await Promise.all([
      video.increment("likes_count", { transaction }),
      channel.increment("likes_count", { transaction }),
    ]);

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

  if (video.is_privet || !video.is_published)
    throw new AppError("Video is privet or not published yet", 401);

  const channel = await video.getChannel();

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
        reaction.update({ is_like: false }, { transaction }),
        video.decrement("likes_count", { transaction }),
        channel.decrement("likes_count", { transaction }),
      ]);
    }

    await Promise.all([
      video.increment("dislikes_count", { transaction }),
      channel.increment("dislikes_count", { transaction }),
    ]);

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

  if (video.is_privet || !video.is_published)
    throw new AppError("Video is privet or not published yet", 401);

  const channel = await video.getChannel();

  const [reaction] = await video.getReactions({
    where: { user_id: user.id },
  });
  if (!reaction) throw new AppError("No reaction found", 404);

  const transaction = await sequelize.transaction();
  try {
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

    video.countReactions({ where }),
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

  if (video.is_privet || !video.is_published)
    throw new AppError("Video is privet or not published yet", 401);

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

    VideoComment.count({
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

  if (video.is_privet || !video.is_published)
    throw new AppError("Video is privet or not published yet", 401);

  let parentComment;
  if (parentCommentId) {
    parentComment = await VideoComment.findByPk(parentCommentId);
    if (!parentComment) throw new AppError("Parent comment not found", 404);

    if (parentComment.video_id !== videoId)
      throw new AppError("Parent comment not found", 404);

    if (parentComment.parent_comment_id)
      throw new AppError("Parent comment cannot be a child comment");
  }

  let comment;
  const transaction = await sequelize.transaction();
  try {
    if (parentCommentId) {
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
