import { Router } from "express";

import * as authTFA from "../../controllers/auth/tfa/index.js";
import validationResult, * as validation from "../../middlewares/isValid.js";
import isAuth from "../../middlewares/isAuth.js";
import tempAuth from "../../middlewares/tempAuth.js";

const router = Router();

// auth/tfa/setup/sms
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

// auth/tfa/setup
router.delete(
  "/setup",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.revokeSetupTFA
);

// auth/tfa
router.get("/", isAuth, authTFA.getCurrentTFAStatus);

// auth/tfa
router.post(
  "/enable",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.enableTFA
);

// auth/tfa
router.delete(
  "/",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.disableTFA
);

// auth/tfa/backup-codes
router.post(
  "/backup-codes",
  isAuth,
  [validation.TFAInput, validationResult],
  authTFA.regenerateBackupCodes
);

// auth/tfa/sms/verify
router.post("/sms/verify", isAuth, authTFA.sendSmsVerificationCode);

// auth/tfa/sms/temp
router.post("/sms/temp", tempAuth, authTFA.sendSmsVerificationCode);

// auth/tfa/verify
router.post("/verify", tempAuth, authTFA.loginVerifyTFA);

export default router;
