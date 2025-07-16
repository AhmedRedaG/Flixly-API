import { Router } from "express";
import passport from "passport";

import * as authGoogle from "../../controllers/auth/google.js";

const router = Router();

// auth/google
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "emails"] })
);

// auth/google/callback
router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  authGoogle.authWithGoogle
);

export default router;
