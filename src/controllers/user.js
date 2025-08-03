import * as userServer from "../services/user.js";
import * as CookieHelper from "../utilities/cookieHelper.js";

// GET /api/v1/users/me
// Headers: Authorization
// Response: { user with channel info }
export const getUserInfo = async (req, res) => {
  const user = req.user;
  const data = await userServer.getUserInfoService(user);
  res.jsend.success(data);
};

// PUT /api/users/me
// Headers: Authorization
// Body: { first_name?, last_name?, username?, bio?, avatar? }
// Response: { user }
export const updateUserInfo = async (req, res) => {
  const user = req.user;
  const { firstName, lastName, username, bio, avatar } = req.body;
  const data = await userServer.updateUserInfoService(
    user,
    firstName,
    lastName,
    username,
    bio,
    avatar
  );
  res.jsend.success(data);
};

// PUT /api/users/me/password
// Headers: Authorization
// Body: { current_password, new_password }
// Response: { message: "Password updated" }
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;
  const data = await userServer.changePasswordService(
    user,
    oldPassword,
    newPassword
  );
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};

// DELETE /api/users/me
// Headers: Authorization
// Response: { message: "Account deleted" }
export const deleteAccount = async (req, res) => {
  const user = req.user;
  const data = await userServer.deleteAccountService(user);
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};
// GET /api/users/me/subscriptions
// Headers: Authorization
// Query: ?page=1&limit=20&sort=newest|oldest
// Response: { subscriptions[], pagination }
export const getUserSubscriptions = async (req, res) => {
  const user = req.user;
  const { page, limit, sort } = req.query;
  const data = await userServer.getUserSubscriptionsService(
    user,
    page,
    limit,
    sort
  );
  res.jsend.success(data);
};

// GET /api/users/me/subscriptions/feed
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos from subscribed channels[], pagination }
export const getUserSubscriptionsFeed = async (req, res) => {
  const user = req.user;
  const { page, limit } = req.query;
  const data = await userServer.getUserSubscriptionsFeedService(
    user,
    page,
    limit
  );
  res.jsend.success(data);
};

// GET /api/users/me/playlists
// Headers: Authorization
// Query: ?page=1&limit=20&include_public=true
// Response: { playlists[], pagination }

// GET /api/users/me/views
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }
export const getUserViews = async (req, res) => {
  const user = req.user;
  const { page, limit } = req.query;
  const data = await userServer.getUserViewsService(user, page, limit);
  res.jsend.success(data);
};

// GET /api/users/me/likes
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }

// GET /api/users/:username
// Response: { user public profile with channel info }
export const getPublicUserInfo = async (req, res) => {
  const { username } = req.params;
  const data = await userServer.getPublicUserInfoService(username);
  res.jsend.success(data);
};
