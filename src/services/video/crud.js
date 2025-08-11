import AppError from "../../utilities/appError.js";
import { db, sequelize } from "../../../database/models/index.js";
import { constants, env } from "../../../config/index.js";

const { PRIVATE_VIDEO_FIELDS } = constants.video;
const { SHORT_CHANNEL_FIELDS } = constants.channel;
const { SHORT_USER_FIELDS } = constants.user;
const { apiUrl, apiVersion } = env.url;
const { User, Channel, Video, VideoComment, Tag } = db;

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

  const videoUploadUrl = `${apiUrl}/api/${apiVersion}/upload/video/${video.id}`;
  const thumbnailUploadUrl = `${apiUrl}/api/${apiVersion}/upload/image/${video.id}?type=thumbnail`;
  const uploadPage = `${apiUrl}/pages/upload`;

  return {
    video,
    videoUploadUrl,
    thumbnailUploadUrl,
    uploadPage,
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
        where: { parent_comment_id: null },
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
        where: { parent_comment_id: null },
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
  isPrivate
) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  if (title) video.title = title;
  if (description) video.description = description;
  if (isPrivate !== undefined) video.is_private = isPrivate;

  await video.save();

  return video;
};

export const deleteVideoService = async (user, videoId) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const [video] = await channel.getVideos({ where: { id: videoId }, limit: 1 });
  if (!video) throw new AppError("Video not found", 404);

  const transaction = await sequelize.transaction();
  try {
    const tags = await video.getTags({ transaction });
    if (tags.length > 0) {
      await Tag.decrement("use_count", {
        where: { id: tags.map((t) => t.id) },
        transaction,
      });
    }

    await Promise.all([
      channel.decrement(
        {
          views_count: video.views_count,
          likes_count: video.likes_count,
          dislikes_count: video.dislikes_count,
          comments_count: video.comments_count,
        },
        { transaction }
      ),

      video.destroy({ transaction }),
    ]);

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

  if (publishAt && new Date(publishAt) > new Date()) {
    video.publish_at = publishAt;
    video.processing_message = "waiting for publish...";
  } else {
    video.publish_at = new Date();
    video.is_published = true;
    video.processing_message = "published -_-";
  }

  await video.save();

  return video;
};
