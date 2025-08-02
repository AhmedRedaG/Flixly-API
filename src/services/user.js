import bcrypt from "bcrypt";

import { db } from "../../database/models/index.js";
import AppError from "../utilities/appError.js";
import { getSafeData } from "../utilities/dataHelper.js";
import * as configs from "../../config/index.js";

const { HASH_PASSWORD_ROUNDS } = configs.constants.bcrypt;
const {
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
      attributes: { exclude: ["id", "user_id", "deleted_at"] },
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

// GET /api/users/:userId/profile
// Response: { user public profile with channel info }

// GET /api/users/me/subscriptions
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { subscriptions[], pagination }

// GET /api/users/me/subscriptions/feed
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos from subscribed channels[], pagination }

// GET /api/users/me/playlists
// Headers: Authorization
// Query: ?page=1&limit=20&include_public=true
// Response: { playlists[], pagination }
