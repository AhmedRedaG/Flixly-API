import { Router } from "express";

import * as authPassword from "../../controllers/auth/password.js";
import validationResult, * as validation from "../../middlewares/isValid.js";
import isAuth from "../../middlewares/isAuth.js";

const router = Router();

// auth/password/change
router.patch(
  "/change",
  isAuth,
  [validation.oldPassword, validation.newPassword, validationResult],
  authPassword.patchChangePassword
);

// auth/password/reset
router.post(
  "/reset",
  [validation.email, validationResult],
  authPassword.postRequestPasswordReset
);

// auth/password/reset/{resetToken}
router.patch(
  "/reset/:resetToken",
  [validation.password, validationResult],
  authPassword.patchResetPassword
);

export default router;
