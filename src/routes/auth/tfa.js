import { Router } from "express";

import * as authTFA from "../../controllers/auth/tfa/index.js";
import { isAuth, isTempAuth } from "../../middlewares/isAuth.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";
import * as fieldValidator from "../../validators/fields/index.js";

const router = Router();

// === SETUP ROUTES ===
// POST auth/2fa/setup/sms => Setup TFA via SMS
router.post(
  "/setup/sms",
  fieldValidator.phoneNumber,
  isValid,
  isAuth,
  authTFA.setupTFASms
);
// POST auth/2fa/setup/totp => Setup TFA via TOTP
router.post("/setup/totp", isAuth, authTFA.setupTFATotp);
// POST auth/tfa/setup => Verify TFA setup
// PATCH auth/tfa/setup => Revoke TFA setup
router
  .post(
    "/setup",
    authValidator.TFAInput,
    isValid,
    isAuth,
    authTFA.verifySetupTFA
  )
  .patch(
    "/setup",
    authValidator.TFAInput,
    isValid,
    isAuth,
    authTFA.revokeSetupTFA
  );

// === MANAGEMENT ROUTES ===
// GET auth/2fa => Get current TFA status
// POST auth/2fa => Enable TFA
// PATCH auth/2fa => Disable TFA
router
  .get("/", isAuth, authTFA.getCurrentTFAStatus)
  .post("/", authValidator.TFAInput, isValid, isAuth, authTFA.enableTFA)
  .patch("/", authValidator.TFAInput, isValid, isAuth, authTFA.disableTFA);

// === VERIFICATION ROUTES ===
// POST auth/2fa/verify => Verify login with TFA code
router.post(
  "/verify",
  authValidator.TFAInput,
  isValid,
  isTempAuth,
  authTFA.loginVerifyTFA
);
// POST auth/2fa/sms/verify => Send verify TFA code via SMS for current auth
// POST auth/2fa/sms/temp => Send verify TFA code via SMS for temporary auth
router.post("/sms/verify", isAuth, authTFA.sendSmsVerificationCode);
router.post("/sms/temp", isTempAuth, authTFA.sendSmsVerificationCode);

// === UTILITY ROUTES ===
// POST auth/2fa/backup-codes => Regenerate backup codes for TFA
router.post(
  "/backup-codes",
  authValidator.TFAInput,
  isValid,
  isAuth,
  authTFA.regenerateBackupCodes
);

export default router;
