import AppError from "../utilities/appError.js";
import { db, sequelize } from "../../database/models/index.js";
import { constants } from "../../config/constants.js";

const { SHORT_USER_FIELDS } = constants.user;

const { VideoComment, User } = db;

export const updateCommentService = async (user, commentId, content) => {
  const comment = await VideoComment.findByPk(commentId);
  if (!comment) throw new AppError("Comment not found", 404);

  if (comment.user_id !== user.id)
    throw new AppError("Unauthorized to update comment", 401);

  await comment.update({ content });

  return { comment };
};

export const deleteCommentService = async (user, commentId) => {
  const comment = await VideoComment.findByPk(commentId);
  if (!comment) throw new AppError("Comment not found", 404);

  const video = await comment.getVideo();
  const videoChannel = await video.getChannel();

  // to allow only comment owner and channel owner to delete the comment
  if (comment.user_id !== user.id) {
    const userChannel = await user.getChannel();
    if (video.channel_id !== userChannel.id)
      throw new AppError("Unauthorized to delete comment", 401);
  }

  const childCommentsCount = comment.child_comments_count;

  const transaction = await sequelize.transaction();
  try {
    await Promise.all([
      video.decrement("comments_count", {
        by: childCommentsCount + 1,
        transaction,
      }),
      videoChannel.decrement("comments_count", {
        by: childCommentsCount + 1,
        transaction,
      }),
      comment.destroy({ transaction }),
    ]);

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return {
    message: "Comment deleted successfully",
  };
};

export const getCommentRepliesService = async (commentId, inPage, inLimit) => {
  const limit = inLimit || 10;
  const page = inPage || 1;
  const offset = (page - 1) * limit;

  const [replies, total] = await Promise.all([
    VideoComment.findAll({
      where: { parent_comment_id: commentId },
      include: {
        model: User,
        as: "user",
        attributes: SHORT_USER_FIELDS,
      },
      limit,
      offset,
    }),

    VideoComment.count({ where: { parent_comment_id: commentId } }),
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    replies,
    pagination,
  };
};
