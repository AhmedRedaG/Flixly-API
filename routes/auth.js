import { Router } from "express";
import passport from "passport";

import * as authController from "../controllers/auth.js";

import validationResult, * as validation from "../middlewares/isValid.js";
import rateLimiter from "../middlewares/rateLimiter.js";

const router = Router();

router.post(
  "/register",
  rateLimiter,
  [
    validation.name,
    validation.email,
    validation.password,
    validation.confirmPassword,
    validationResult,
  ],
  authController.postRegister
);

router.post(
  "/login",
  rateLimiter,
  [validation.email, validation.password, validationResult],
  authController.postLogin
);

router.get("/google", passport.authenticate("google", { scope: "profile" }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/",
  }),
  authController.authWithGoogle
);

router.post("/refresh", rateLimiter, authController.postRefresh);

router.post("/logout", authController.postLogout);

export default router;
