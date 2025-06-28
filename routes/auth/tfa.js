import { Router } from "express";

import * as authTFA from "../../controllers/auth/tfa.js";

import validationResult, * as validation from "../../middlewares/isValid.js";
import isAuth from "../../middlewares/isAuth.js";
import tempAuth from "../../middlewares/tempAuth.js";
import rateLimiter from "../../middlewares/rateLimiter.js";

const router = Router();

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

router.post("/2fa/method", isAuth, rateLimiter, authTFA.requestTFAMethod);

router.post("/2fa/request", isAuth, rateLimiter, authTFA.requestSmsTFACode);

router.post(
  "/2fa/temp-request",
  tempAuth,
  rateLimiter,
  authTFA.requestSmsTFACode
);

router.post("/2fa/verify", tempAuth, rateLimiter, authTFA.verifyLoginWithTFA);

export default router;
