import bcrypt from "bcrypt";
import { Op } from "sequelize";

import AppError from "../utilities/appError.js";
import getPaginationParams from "../utilities/paginationUtil.js";
import { db, sequelize } from "../../database/models/index.js";
import { constants } from "../../config/constants.js";

const { HASH_PASSWORD_ROUNDS } = constants.bcrypt;
const { SHORT_VIDEO_FIELDS } = constants.video;
const { SHORT_CHANNEL_FIELDS } = constants.channel;
const { PRIVATE_USER_FIELDS } = constants.user;
const { User, RefreshToken, Channel, Video, Subscription } = db;

export const getUserInfoService = async (user) => {
  const [channel, viewCount, reactionCount, commentCount, subscriptionsCount] =
    await Promise.all([
      user.getChannel(),
      user.countVideoViews(),
      user.countVideoReactions(),
      user.countVideoComments(),
      user.countSubscriptions(),
    ]);

  const stats = {
    totalViews: viewCount,
    totalReactions: reactionCount,
    totalComments: commentCount,
    totalSubscriptions: subscriptionsCount,
  };

  return {
    user: {
      ...user.dataValues,
      channel,
      stats,
    },
  };
};

export const updateUserInfoService = async (
  user,
  firstName,
  lastName,
  username,
  bio
) => {
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (bio) user.bio = bio;

  if (username) {
    const userExisted = await User.findOne({ where: { username } });
    if (userExisted) throw new AppError("Username already in use", 409);

    user.username = username;
  }

  await user.save();

  return {
    user,
  };
};

export const changePasswordService = async (
  authedUser,
  oldPassword,
  newPassword
) => {
  // because i excluded the password in the Auth middleware
  const user = await User.findByPk(authedUser.id);

  // Google acc
  if (!user.password)
    throw new AppError("This account was registered with Google.", 401);

  const matchedPasswords = await bcrypt.compare(oldPassword, user.password);
  if (!matchedPasswords) throw new AppError("Old password is wrong", 401);

  if (newPassword === oldPassword)
    throw new AppError("New password must be different from old password");

  const newHashedPassword = await bcrypt.hash(
    newPassword,
    HASH_PASSWORD_ROUNDS
  );

  const transaction = await sequelize.transaction();
  try {
    await Promise.all([
      user.update({ password: newHashedPassword }, { transaction }),
      RefreshToken.destroy({ where: { user_id: user.id }, transaction }),
    ]);

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return {
    message: "Password has been successfully changed.",
  };
};

export const deleteAccountService = async (user) => {
  await user.destroy();

  return {
    message: "Account deleted successfully",
  };
};

export const getUserSubscriptionsService = async (
  user,
  inPage,
  inLimit,
  sort
) => {
  const { page, limit, offset } = getPaginationParams(inPage, inLimit);
  const order =
    sort === "newest" ? [["created_at", "DESC"]] : [["created_at", "ASC"]];

  const [subscriptions, total] = await Promise.all([
    user.getSubscriptions({
      include: {
        model: Channel,
        as: "channel",
        attributes: SHORT_CHANNEL_FIELDS,
      },
      attributes: ["created_at"],
      order,
      limit,
      offset,
    }),

    user.countSubscriptions(),
  ]);

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return {
    subscriptions,
    pagination,
  };
};

export const getUserSubscriptionsFeedService = async (
  user,
  inPage,
  inLimit
) => {
  const { page, limit, offset } = getPaginationParams(inPage, inLimit);

  const subscribedChannelIds = await user
    .getSubscriptions({ attributes: ["channel_id"] })
    .then((subs) => subs.map((sub) => sub.channel_id));

  if (subscribedChannelIds.length === 0) {
    return {
      videos: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }

  const [videos, total] = await Promise.all([
    Video.findAll({
      attributes: SHORT_VIDEO_FIELDS,
      include: {
        model: Channel,
        as: "channel",
        attributes: SHORT_CHANNEL_FIELDS,
      },
      where: {
        channel_id: { [Op.in]: subscribedChannelIds },
        is_published: true,
        is_private: false,
      },
      order: [["publish_at", "DESC"]],
      limit,
      offset,
    }),

    Video.count({
      where: {
        channel_id: { [Op.in]: subscribedChannelIds },
        is_published: true,
        is_private: false,
      },
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

// =============== IN-DEVELOPMENT ================
// GET /api/users/me/playlists
// Headers: Authorization
// Query: ?page=1&limit=20&include_public=true
// Response: { playlists[], pagination }

export const getUserViewsService = async (user, inPage, inLimit) => {
  const { page, limit, offset } = getPaginationParams(inPage, inLimit);

  const [videos, total] = await Promise.all([
    user.getVideoViews({
      attributes: [],
      include: {
        model: Video,
        as: "video",
        attributes: SHORT_VIDEO_FIELDS,
        where: { is_published: true, is_private: false },
      },
      order: [["watched_at", "DESC"]],
      limit,
      offset,
    }),
    user.countVideoViews({
      include: {
        model: Video,
        as: "video",
        attributes: [],
        where: { is_published: true, is_private: false },
      },
      distinct: true,
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

export const getUserLikesService = async (user, inPage, inLimit) => {
  const { page, limit, offset } = getPaginationParams(inPage, inLimit);

  const [videos, total] = await Promise.all([
    user.getVideoReactions({
      attributes: [],
      include: {
        model: Video,
        as: "video",
        attributes: SHORT_VIDEO_FIELDS,
        where: { is_published: true, is_private: false },
      },
      where: { is_like: true },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    }),
    user.countVideoReactions({
      include: {
        model: Video,
        as: "video",
        attributes: [],
        where: { is_published: true, is_private: false },
      },
      distinct: true,
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

export const getPublicUserInfoService = async (username) => {
  const user = await User.findOne({
    attributes: {
      exclude: PRIVATE_USER_FIELDS,
    },
    where: { username },
    include: {
      model: Channel,
      as: "channel",
      attributes: SHORT_CHANNEL_FIELDS,
    },
  });
  if (!user)
    throw new AppError("User not found with the provided username", 404);

  return {
    user,
  };
};
