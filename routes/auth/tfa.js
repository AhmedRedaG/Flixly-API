import { Router } from "express";

import * as authTFA from "../../controllers/auth/tfa.js";

import validationResult, * as validation from "../../middlewares/isValid.js";
import isAuth from "../../middlewares/isAuth.js";
import tempAuth from "../../middlewares/tempAuth.js";
import rateLimiter from "../../middlewares/rateLimiter.js";

const router = Router();

// auth/tfa/setup/sms
router.put(
  "/setup/sms",
  isAuth,
  rateLimiter,
  [validation.phoneNumber, validationResult],
  authTFA.setupTFASms
);

// auth/tfa/setup/totp
router.put("/setup/totp", isAuth, rateLimiter, authTFA.setupTFATotp);

// auth/tfa/setup/verify
router.post(
  "/setup/verify",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.verifySetupTFA
);

// auth/tfa/setup/remove
router.delete(
  "/setup/remove",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.removeSetupTFA
);

// auth/tfa/enable
router.post(
  "/enable",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.enableTFA
);

// auth/tfa/disable
router.delete(
  "/disable",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.disableTFA
);

// auth/tfa/backup-codes
router.post(
  "/backup-codes",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.requestBackupCodes
);

// auth/tfa/method
router.post("/method", isAuth, rateLimiter, authTFA.requestTFAMethod);

// auth/tfa/request
router.post("request", isAuth, rateLimiter, authTFA.requestSmsTFACode);

// auth/tfa/temp-request
router.post("/temp-request", tempAuth, rateLimiter, authTFA.requestSmsTFACode);

// auth/tfa/verify
router.post("/verify", tempAuth, rateLimiter, authTFA.verifyLoginWithTFA);

export default router;
