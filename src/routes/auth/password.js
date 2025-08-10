import { Router } from "express";

import * as authController from "../../controllers/auth.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";

const router = Router();

// POST auth/password/reset
router.post(
  "/reset",
  ...authValidator.requestReset,
  isValid,
  authController.requestResetPasswordMail
);

// PATCH auth/password/reset
router.patch(
  "/reset",
  ...authValidator.resetPassword,
  isValid,
  authController.resetPassword
);

export default router;
