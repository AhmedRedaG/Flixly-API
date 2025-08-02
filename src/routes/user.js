import { Router } from "express";

import { getUser } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.get("/", isAuth, getUser);

// GET /api/users/me
// Headers: Authorization
// Response: { user with channel info }

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

export default router;
