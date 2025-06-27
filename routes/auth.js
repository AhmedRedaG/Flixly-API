import { Router } from "express";
import passport from "passport";

import * as authNormal from "../controllers/auth/locals.js";
import * as authGoogle from "../controllers/auth/google.js";
import * as authPassword from "../controllers/auth/password.js";
import * as authRefresh from "../controllers/auth/refresh.js";
import * as authTFA from "../controllers/auth/tfa.js";

import validationResult, * as validation from "../middlewares/isValid.js";
import isAuth from "../middlewares/isAuth.js";
import tempAuth from "../middlewares/tempAuth.js";
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
  "/reset-password",
  [validation.email, validationResult],
  authPassword.postRequestPasswordReset
);

router.patch(
  "/reset-password/:resetToken",
  [validation.password, validationResult],
  authPassword.patchResetPassword
);

router.put(
  "/2fa/setup/sms",
  isAuth,
  rateLimiter,
  [validation.phoneNumber, validationResult],
  authTFA.setupTFASms
);

router.put("/2fa/setup/totp", isAuth, rateLimiter, authTFA.setupTFATotp);

router.post(
  "/2fa/setup/verify",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.verifySetupTFA
);

router.delete(
  "/2fa/setup/remove",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.removeSetupTFA
);

router.post(
  "/2fa/enable",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.enableTFA
);

router.delete(
  "/2fa/disable",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.disableTFA
);

router.post(
  "/2fa/backup-codes",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.requestBackupCodes
);

router.post("/2fa/request", isAuth, rateLimiter, authTFA.requestSmsTFACode);

router.post(
  "/2fa/temp-request",
  tempAuth,
  rateLimiter,
  authTFA.requestSmsTFACode
);

router.post("/2fa/verify", tempAuth, rateLimiter, authTFA.verifyLoginWithTFA);

router.post("/refresh", rateLimiter, authRefresh.postRefresh);

router.delete("/logout", authNormal.postLogout);

export default router;
