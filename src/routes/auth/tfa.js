import { Router } from "express";

import * as authTFA from "../../controllers/auth/tfa/index.js";
import isAuth from "../../middlewares/isAuth.js";
import tempAuth from "../../middlewares/tempAuth.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";
import * as fieldValidator from "../../validators/fields/index.js";

const router = Router();

// auth/2fa/setup/sms
router.put(
  "/setup/sms",
  fieldValidator.phoneNumber,
  isValid,
  isAuth,
  authTFA.setupTFASms
);

// auth/tfa/setup/totp
router.put("/setup/totp", isAuth, authTFA.setupTFATotp);

// auth/tfa/setup
router.post(
  "/setup",
  authValidator.TFAInput,
  isValid,
  isAuth,
  authTFA.verifySetupTFA
);

// auth/2fa/setup
router.delete(
  "/setup",
  authValidator.TFAInput,
  isValid,
  isAuth,
  authTFA.revokeSetupTFA
);

// auth/2fa
router.get("/", isAuth, authTFA.getCurrentTFAStatus);

// auth/2fa
router.post("/", authValidator.TFAInput, isValid, isAuth, authTFA.enableTFA);

// auth/2fa
router.delete("/", authValidator.TFAInput, isValid, isAuth, authTFA.disableTFA);

// auth/2fa/backup-codes
router.post(
  "/backup-codes",
  authValidator.TFAInput,
  isValid,
  isAuth,
  authTFA.regenerateBackupCodes
);

// auth/2fa/sms/verify
router.post("/sms/verify", isAuth, authTFA.sendSmsVerificationCode);

// auth/2fa/sms/temp
router.post("/sms/temp", tempAuth, authTFA.sendSmsVerificationCode);

// auth/2fa/verify
router.post(
  "/verify",
  authValidator.TFAInput,
  isValid,
  tempAuth,
  authTFA.loginVerifyTFA
);

export default router;
