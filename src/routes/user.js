import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as userController from "../controllers/user.js";
import isValid from "../middlewares/isValid.js";
import * as userValidator from "../validators/shared/user.js";

const router = Router();

// GET users/me
// Headers: Authorization
// Response: { user with channel and status info }
router.get("/me", isAuth, userController.getUserInfo);

// PUT users/me
// Headers: Authorization
// Body: { first_name?, last_name?, username?, bio?}
// Response: { user }
router.put(
  "/me",
  isAuth,
  userValidator.updateMe,
  isValid,
  userController.updateUserInfo
);

// PUT users/me/password
// Headers: Authorization
// Body: { oldPassword, newPassword }
// Response: { message: "Password has been successfully changed." }
router.put(
  "/me/password",
  userValidator.changePassword,
  isValid,
  isAuth,
  userController.changePassword
);

// DELETE users/me
// Headers: Authorization
// Response: { message: "Account deleted successfully" }
router.delete("/me", isAuth, userController.deleteAccount);

// GET users/me/subscriptions
// Headers: Authorization
// Query: ?page=1&limit=20&sort=newest|oldest
// Response: { subscriptions[], pagination }
router.get(
  "/me/subscriptions",
  isAuth,
  userValidator.pagingWithSort,
  isValid,
  userController.getUserSubscriptions
);

// GET users/me/subscriptions/feed
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos from subscribed channels[], pagination }
router.get(
  "/me/subscriptions/feed",
  isAuth,
  userValidator.pagingOnly,
  isValid,
  userController.getUserSubscriptionsFeed
);

// ============ IN-DEVELOPMENT ==============
// GET /api/users/me/playlists
// Headers: Authorization
// Query: ?page=1&limit=20&include_public=true
// Response: { playlists[], pagination }

// GET users/me/views
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }
router.get(
  "/me/views",
  isAuth,
  userValidator.pagingOnly,
  isValid,
  userController.getUserViews
);

// GET users/me/likes
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }
router.get(
  "/me/likes",
  isAuth,
  userValidator.pagingOnly,
  isValid,
  userController.getUserLikes
);

// GET users/:username
// Response: { user public profile with channel info }
router.get(
  "/:username",
  userValidator.usernamePath,
  isValid,
  userController.getPublicUserInfo
);

export default router;
