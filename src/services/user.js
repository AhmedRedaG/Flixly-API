import { db } from "../../database/models/index.js";
import { getSafeData } from "../utilities/dataHelper.js";

const { User } = db;

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

// PUT /api/users/me/password
// Headers: Authorization
// Body: { current_password, new_password }
// Response: { message: "Password updated" }

// DELETE /api/users/me
// Headers: Authorization
// Response: { message: "Account deleted" }

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
