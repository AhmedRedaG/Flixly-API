import { Router } from "express";

import * as authPassword from "../../controllers/auth/password.js";
import { isAuth } from "../../middlewares/isAuth.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";
import * as fieldValidator from "../../validators/fields/index.js";

const router = Router();

// PATCH auth/password/change
router.patch(
  "/change",
  authValidator.changePassword,
  isValid,
  isAuth,
  authPassword.patchChangePassword
);

// POST auth/password/reset
router.post(
  "/reset",
  fieldValidator.email,
  isValid,
  authPassword.postRequestPasswordReset
);

// PATCH auth/password/reset/{resetToken}
router.patch(
  "/reset/:resetToken",
  fieldValidator.password,
  isValid,
  authPassword.patchResetPassword
);

export default router;
