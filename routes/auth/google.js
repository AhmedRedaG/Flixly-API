import { Router } from "express";
import passport from "passport";

import * as authGoogle from "../../controllers/auth/google.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authGoogle.authWithGoogle
);

export default router;
