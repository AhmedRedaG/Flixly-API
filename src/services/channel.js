import { db, sequelize } from "../../database/models/index.js";
import AppError from "../utilities/appError.js";
import { constants } from "../../config/constants.js";

const { HASH_PASSWORD_ROUNDS } = constants.bcrypt;
const { PRIVATE_VIDEO_FIELDS, SHORT_VIDEO_FIELDS } = constants.video;
const { SHORT_CHANNEL_FIELDS } = constants.channel;
const { PRIVATE_USER_FIELDS, SHORT_USER_FIELDS } = constants.user;
const { User, Channel, Subscription } = db;

export const createChannelService = async (
  user,
  username,
  name,
  description
) => {
  const channelExisted = await user.getChannel();
  if (channelExisted) throw new AppError("User already has a channel", 409);

  const usernameExisted = await Channel.findOne({ where: { username } });
  if (usernameExisted) throw new AppError("Username already exists", 409);

  const channel = await user.createChannel({
    username,
    name,
    description,
  });

  return {
    channel,
  };
};

export const getChannelService = async (user) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const recentVideos = await channel.getVideos({
    attributes: SHORT_VIDEO_FIELDS,
    order: [["publish_at", "DESC"]],
    limit: 10,
  });

  return {
    channel: {
      ...channel.dataValues,
      recentVideos,
    },
  };
};

export const getPublicChannelService = async (username) => {
  const channel = await Channel.findOne({ where: { username } });
  if (!channel) throw new AppError("Channel not found", 404);

  const recentVideos = await channel.getVideos({
    attributes: SHORT_VIDEO_FIELDS,
    where: { is_published: true, is_private: false },
    order: [["publish_at", "DESC"]],
    limit: 10,
    raw: true,
  });

  return {
    channel: {
      ...channel.dataValues,
      recentVideos,
    },
  };
};

export const updateChannelService = async (user, name, description) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  if (name) channel.name = name;
  if (description) channel.description = description;

  await channel.save();

  return {
    channel,
  };
};

export const deleteChannelService = async (user) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  await channel.destroy();

  return {
    message: "Channel deleted successfully",
  };
};

export const getChannelVideosService = async (
  user,
  inPage,
  inLimit,
  sort,
  privateOnly,
  unpublishedOnly
) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest"
      ? [["created_at", "DESC"]]
      : sort === "oldest"
      ? [["created_at", "ASC"]]
      : [["views_count", "DESC"]];
  const where = privateOnly
    ? { is_private: true }
    : unpublishedOnly
    ? { is_published: false }
    : {};

  const [videos, total] = await Promise.all([
    channel.getVideos({ where, order, limit, offset }),
    channel.countVideos({ where }),
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

export const getPublicChannelVideosService = async (
  username,
  inPage,
  inLimit,
  sort
) => {
  const channel = await Channel.findOne({ where: { username } });
  if (!channel) throw new AppError("Channel not found", 404);

  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest"
      ? [["created_at", "DESC"]]
      : sort === "oldest"
      ? [["created_at", "ASC"]]
      : [["views_count", "DESC"]];

  const [videos, total] = await Promise.all([
    channel.getVideos({
      attributes: SHORT_VIDEO_FIELDS,
      where: { is_published: true, is_private: false },
      order,
      limit,
      offset,
    }),
    channel.countVideos({ where: { is_published: true, is_private: false } }),
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

export const getChannelSubscribersService = async (
  user,
  inPage,
  inLimit,
  sort
) => {
  const channel = await user.getChannel();
  if (!channel) throw new AppError("Channel not found", 404);

  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest" ? [["created_at", "DESC"]] : [["created_at", "ASC"]];

  const subscribers = await channel.getSubscriptions({
    include: {
      model: User,
      as: "subscriber",
      attributes: SHORT_USER_FIELDS,
    },
    order,
    limit,
    offset,
  });
  const total = channel.subscribers;

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    subscribers,
    pagination,
  };
};

export const subscribeChannelService = async (user, username) => {
  const channel = await Channel.findOne({ where: { username } });
  if (!channel) throw new AppError("Channel not found", 404);

  if (channel.user_id === user.id)
    throw new AppError("Cannot subscribe to own channel", 409);

  const subscription = await channel.getSubscriptions({
    where: { subscriber_id: user.id },
  });
  if (subscription)
    throw new AppError("Already subscribed to this channel", 409);

  const transaction = await sequelize.transaction();
  try {
    await Promise.all([
      channel.increment("subscribers", { transaction }),
      channel.createSubscription({ subscriber_id: user.id }, { transaction }),
    ]);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new Error(err.message);
  }

  return {
    subscribed: true,
    subscribersCount: channel.subscribers,
  };
};

export const unsubscribeChannelService = async (user, username) => {
  const channel = await Channel.findOne({ where: { username } });
  if (!channel) throw new AppError("Channel not found", 404);

  if (channel.user_id === user.id)
    throw new AppError("Cannot unsubscribe to own channel", 409);

  const subscription = await channel.getSubscriptions({
    where: { subscriber_id: user.id },
  });
  if (!subscription)
    throw new AppError("Already unsubscribed to this channel", 409);

  const transaction = await sequelize.transaction();
  try {
    await Promise.all([
      channel.decrement("subscribers", { transaction }),
      Subscription.destroy({
        where: { subscriber_id: user.id, channel_id: channel.id },
        transaction,
      }),
    ]);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new Error(err.message);
  }

  return {
    subscribed: false,
    subscribersCount: channel.subscribers,
  };
};
