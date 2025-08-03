import { Router } from "express";

import { isAuth } from "../middlewares/isAuth.js";
import * as userController from "../controllers/user.js";
import * as authValidator from "../validators/shared/auth.js";
import isValid from "../middlewares/isValid.js";

const router = Router();

// GET /api/v1/users/me
// Headers: Authorization
// Response: { user with channel info }
router.get("/me", isAuth, userController.getUserInfo);

// PUT /api/users/me
// Headers: Authorization
// Body: { first_name?, last_name?, username?, bio?, avatar? }
// Response: { user }
router.put("/me", isAuth, userController.updateUserInfo);

// PUT /api/users/me/password
// Headers: Authorization
// Body: { current_password, new_password }
// Response: { message: "Password updated" }
// PATCH auth/password/change
router.put(
  "/me/password",
  authValidator.changePassword,
  isValid,
  isAuth,
  userController.changePassword
);

// DELETE /api/users/me
// Headers: Authorization
// Response: { message: "Account deleted" }
router.delete("/me", isAuth, userController.deleteAccount);

/// GET /api/users/me/subscriptions
// Headers: Authorization
// Query: ?page=1&limit=20&sort=newest|oldest
// Response: { subscriptions[], pagination }
router.get("/me/subscriptions", isAuth, userController.getUserSubscriptions);

// GET /api/users/me/subscriptions/feed
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos from subscribed channels[], pagination }
router.get(
  "/me/subscriptions/feed",
  isAuth,
  userController.getUserSubscriptionsFeed
);

// GET /api/users/me/playlists
// Headers: Authorization
// Query: ?page=1&limit=20&include_public=true
// Response: { playlists[], pagination }

// GET /api/users/me/views
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }
router.get("/me/views", isAuth, userController.getUserViews);

// GET /api/users/me/likes
// Headers: Authorization
// Query: ?page=1&limit=20
// Response: { videos[], pagination }
router.get("/me/likes", isAuth, userController.getUserLikes);

// GET /api/users/:username
// Response: { user public profile with channel info }
router.get("/:username", userController.getPublicUserInfo);

export default router;
