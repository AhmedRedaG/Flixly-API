import { Router } from "express";
import passport from "passport";

import * as authNormal from "../controllers/auth/normal.js";
import * as authGoogle from "../controllers/auth/google.js";
import * as authPassword from "../controllers/auth/password.js";
import * as authRefresh from "../controllers/auth/refresh.js";
import * as authTFA from "../controllers/auth/tfa.js";

import validationResult, * as validation from "../middlewares/isValid.js";
import isAuth from "../middlewares/isAuth.js";
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
  authNormal.postRegister
);

router.post(
  "/login",
  rateLimiter,
  [validation.email, validation.password, validationResult],
  authNormal.postLogin
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authGoogle.authWithGoogle
);

router.patch(
  "/change-password",
  isAuth,
  [validation.oldPassword, validation.newPassword, validationResult],
  authPassword.patchChangePassword
);

router.post(
  "/request-password-reset",
  [validation.email, validationResult],
  authPassword.postRequestPasswordReset
);

router.patch(
  "/reset-password/:resetToken",
  [validation.password, validationResult],
  authPassword.patchResetPassword
);

router.post(
  "/2fa/enable",
  isAuth,
  rateLimiter,
  [validation.phoneNumber, validationResult],
  authTFA.postEnableTFA
);

router.post(
  "/2fa/verify-setup",
  isAuth,
  rateLimiter,
  authTFA.postVerifySetupTFA
);

router.post(
  "/2fa/request",
  [validation.email, validationResult],
  authTFA.postRequestTFACode
);

router.post("/refresh", rateLimiter, authRefresh.postRefresh);

router.post("/logout", authNormal.postLogout);

export default router;
