import { Router } from "express";
import passport from "passport";

import * as authController from "../../controllers/auth.js";

const router = Router();

// GET auth/google
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET auth/google/callback
router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  authController.authWithGoogle
);

export default router;
