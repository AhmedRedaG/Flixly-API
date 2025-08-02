import * as userService from "../services/user.js";

// GET /api/v1/users/me
// Headers: Authorization
// Response: { user with channel info }
export const getUserInfo = async (req, res) => {
  const user = req.user;
  const data = await userService.getUserInfoService(user);
  res.jsend.success(data);
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
