import bcrypt from "bcrypt";

import { db } from "../../database/models/index.js";
import AppError from "../utilities/appError.js";
import { getSafeData } from "../utilities/dataHelper.js";
import * as configs from "../../config/index.js";

const { HASH_PASSWORD_ROUNDS } = configs.constants.bcrypt;
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

// GET /api/v1/users/me
// Headers: Authorization
// Response: { user with channel info }
export const getUserInfoService = async (user) => {
  const userData = getSafeData(user);
  const [
    channel,
    viewCount,
    reactionCount,
    commentCount,
    subscriptionsCount,
    playlistsCount,
    reportsCount,
  ] = await Promise.all([
    user.getChannel({
      attributes: { exclude: ["id", "user_id"] },
    }),
    user.countVideoViews(),
    user.countVideoReactions(),
    user.countVideoComments(),
    user.countSubscriptions(),
    user.countPlaylists(),
    user.countReports(),
  ]);

  const stats = {
    totalViews: viewCount,
    totalReactions: reactionCount,
    totalComments: commentCount,
    totalSubscriptions: subscriptionsCount,
    totalPlaylists: playlistsCount,
    totalReports: reportsCount,
  };

  return {
    user: {
      ...userData,
      channel,
      stats,
    },
  };
};

// PUT /api/users/me
// Headers: Authorization
// Body: { first_name?, last_name?, username?, bio?, avatar? }
// Response: { user }
export const updateUserInfoService = async (
  user,
  firstName,
  lastName,
  username,
  bio,
  avatar
) => {
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (username) user.username = username;
  if (bio) user.bio = bio;
  if (avatar) user.avatar = avatar;

  await user.save();

  const userData = getSafeData(user);

  return {
    user: userData,
  };
};

// PUT /api/users/me/password
// Headers: Authorization
// Body: { current_password, new_password }
// Response: { message: "Password updated" }
export const changePasswordService = async (user, oldPassword, newPassword) => {
  if (!user.password)
    throw new AppError("This account was registered with Google.", 401);

  // verify old password
  const matchedPasswords = await bcrypt.compare(oldPassword, user.password);
  if (!matchedPasswords) throw new AppError("Old password is wrong", 401);

  if (newPassword === oldPassword)
    throw new AppError("New password must be different from old password");

  // hash new password and save
  const newHashedPassword = await bcrypt.hash(
    newPassword,
    HASH_PASSWORD_ROUNDS
  );
  user.password = newHashedPassword;

  await Promise.all([
    user.save(),
    RefreshToken.destroy({ where: { user_id: user.id } }),
  ]);

  return {
    message: "Password has been successfully changed. Please login again.",
  };
};

// DELETE /api/users/me
// Headers: Authorization
// Response: { message: "Account deleted" }
export const deleteAccountService = async (user) => {
  await user.destroy();

  return {
    message: "Account deleted successfully",
  };
};

// GET /api/users/me/subscriptions
// Headers: Authorization
// Query: ?page=1&limit=20&sort=newest|oldest
// Response: { subscriptions[], pagination }
export const getUserSubscriptionsService = async (
  user,
  inPage,
  inLimit,
  sort
) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;
  const order =
    sort === "newest" ? [["created_at", "DESC"]] : [["created_at", "ASC"]];

  const subscriptions = await user.getSubscriptions({
    include: {
      model: Channel,
      as: "channel",
      attributes: ["username", "name", "avatar"],
    },
    attributes: ["created_at"],
    order,
    limit,
    offset,
    raw: true,
  });
  const total = subscriptions?.length || 0;

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

// GET /api/users/me/subscriptions/feed
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos from subscribed channels[], pagination }
export const getUserSubscriptionsFeedService = async (
  user,
  inPage,
  inLimit
) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;

  // const subscriptions = await user.getSubscriptions({
  //   include: {
  //     model: Channel,
  //     as: "channel",
  //   },
  // });
  // const channels = subscriptions.map((subscription) => subscription.channel);
  // const videos = await Promise.all(
  //   channels.map((channel) =>
  //     channel.getVideos({
  //       attributes: publicVideoFields,
  //       where: { is_published: true, is_private: false },
  //       order: [["created_at", "DESC"]],
  //       limit,
  //       offset,
  //       raw: true,
  //     })
  //   )
  // );
  // const total = videos.flat().length || 0;

  const videos = Video.findAll({
    attributes: publicVideoFields,
    include: {
      model: Channel,
      as: "channel",
      include: {
        model: Subscription,
        as: "subscriptions",
        where: { subscriber_id: user.id },
      },
    },
    where: { is_published: true, is_private: false },
    order: [["publish_at", "DESC"]],
    limit,
    offset,
    raw: true,
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

// GET /api/users/me/playlists
// Headers: Authorization
// Query: ?page=1&limit=20&include_public=true
// Response: { playlists[], pagination }

// GET /api/users/me/views
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }
export const getUserViewsService = async (user, inPage, inLimit) => {
  const limit = inLimit || 20;
  const page = inPage || 1;
  const offset = (page - 1) * limit;

  const videos = await user.getVideoViews({
    include: {
      model: Video,
      as: "video",
      attributes: publicVideoFields,
    },
    order: [["watched_at", "DESC"]],
    limit,
    offset,
    raw: true,
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

// GET /api/users/me/likes
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }

// GET /api/users/:username
// Response: { user public profile with channel info }
export const getPublicUserInfoService = async (username) => {
  const user = await User.findOne({
    where: { username },
    include: {
      model: Channel,
      as: "channel",
      attributes: [
        "username",
        "name",
        "description",
        "avatar",
        "banner",
        "subscribers",
        "views_count",
      ],
    },
  });
  if (!user) throw new AppError("User not found with the provided ID", 404);

  const userData = getSafeData(user, { public: true });

  return {
    user: userData,
  };
};
