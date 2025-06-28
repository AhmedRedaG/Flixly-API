import { Router } from "express";

import * as authTFA from "../../controllers/auth/tfa/index.js";
import validationResult, * as validation from "../../middlewares/isValid.js";
import isAuth from "../../middlewares/isAuth.js";
import tempAuth from "../../middlewares/tempAuth.js";

const router = Router();

// auth/2fa/setup/sms
router.put(
  "/setup/sms",
  isAuth,
  [validation.phoneNumber, validationResult],
  authTFA.setupTFASms
);

// auth/tfa/setup/totp
router.put("/setup/totp", isAuth, authTFA.setupTFATotp);

// auth/tfa/setup
router.post(
  "/setup",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.verifySetupTFA
);

// auth/2fa/setup
router.delete(
  "/setup",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.revokeSetupTFA
);

// auth/2fa
router.get("/", isAuth, authTFA.getCurrentTFAStatus);

// auth/2fa
router.post(
  "/",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.enableTFA
);

// auth/2fa
router.delete(
  "/",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.disableTFA
);

// auth/2fa/backup-codes
router.post(
  "/backup-codes",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.regenerateBackupCodes
);

// auth/2fa/sms/verify
router.post("/sms/verify", isAuth, authTFA.sendSmsVerificationCode);

// auth/2fa/sms/temp
router.post("/sms/temp", tempAuth, authTFA.sendSmsVerificationCode);

// auth/2fa/verify
router.post("/verify", tempAuth, authTFA.loginVerifyTFA);

export default router;
