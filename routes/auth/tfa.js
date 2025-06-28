import { Router } from "express";

import * as authTFA from "../../controllers/auth/tfa/index.js";

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

// auth/tfa/setup
router.post(
  "/setup",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.verifySetupTFA
);

// auth/tfa/setup
router.delete(
  "/setup",
  isAuth,
  rateLimiter,
  [validation.TFAInput, validationResult],
  authTFA.revokeSetupTFA
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
  authTFA.regenerateBackupCodes
);

// auth/tfa/status
router.get("/status", isAuth, rateLimiter, authTFA.getCurrentTFAStatus);

// auth/tfa/sms/verify
router.post(
  "/sms/verify",
  isAuth,
  rateLimiter,
  authTFA.sendSmsVerificationCode
);

// auth/tfa/sms/temp
router.post(
  "/sms/temp",
  tempAuth,
  rateLimiter,
  authTFA.sendSmsVerificationCode
);

// auth/tfa/verify
router.post("/verify", tempAuth, rateLimiter, authTFA.loginVerifyTFA);

export default router;
