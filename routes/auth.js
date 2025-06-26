import { Router } from "express";
import passport from "passport";

import * as authNormal from "../controllers/auth/locals.js";
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

router.post("/2fa/setup", isAuth, rateLimiter, authTFA.setupTFA);

router.post("/2fa/enable", isAuth, rateLimiter, authTFA.enableTFA);

router.put(
  "/2fa/update",
  isAuth,
  rateLimiter,
  [validation.phoneNumber, validationResult],
  authTFA.updateTFA
);

router.delete("/2fa/disable", isAuth, rateLimiter, authTFA.disableTFA);

router.post(
  "/2fa/backup-codes",
  isAuth,
  rateLimiter,
  authTFA.requestNewBackupCodes
);

router.post("/2fa/request", rateLimiter, authTFA.requestTFACode);

router.post("/2fa/verify", rateLimiter, authTFA.verifyLoginWithTFA);

router.post("/refresh", rateLimiter, authRefresh.postRefresh);

router.post("/logout", authNormal.postLogout);

export default router;
