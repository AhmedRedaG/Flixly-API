import * as userServer from "../services/user.js";
import * as CookieHelper from "../utilities/cookieHelper.js";

export const getUserInfo = async (req, res) => {
  const user = req.user;
  const data = await userServer.getUserInfoService(user);
  res.jsend.success(data);
};

export const updateUserInfo = async (req, res) => {
  const user = req.user;
  const { firstName, lastName, username, bio } = req.body;
  const data = await userServer.updateUserInfoService(
    user,
    firstName,
    lastName,
    username,
    bio
  );
  res.jsend.success(data);
};

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

export const deleteAccount = async (req, res) => {
  const user = req.user;
  const data = await userServer.deleteAccountService(user);
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};

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

// =========== IN-DEVELOPMENT =============
// GET /users/me/playlists
// Headers: Authorization
// Query: ?page=1&limit=20&include_public=true
// Response: { playlists[], pagination }

export const getUserViews = async (req, res) => {
  const user = req.user;
  const { page, limit } = req.query;
  const data = await userServer.getUserViewsService(user, page, limit);
  res.jsend.success(data);
};

export const getUserLikes = async (req, res) => {
  const user = req.user;
  const { page, limit } = req.query;
  const data = await userServer.getUserLikesService(user, page, limit);
  res.jsend.success(data);
};

export const getPublicUserInfo = async (req, res) => {
  const { username } = req.params;
  const data = await userServer.getPublicUserInfoService(username);
  res.jsend.success(data);
};
