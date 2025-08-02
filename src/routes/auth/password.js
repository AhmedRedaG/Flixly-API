import { Router } from "express";

import * as authPassword from "../../controllers/auth/password.js";
import isValid from "../../middlewares/isValid.js";
import * as fieldValidator from "../../validators/fields/index.js";

const router = Router();

// POST auth/password/reset
router.post(
  "/reset",
  fieldValidator.email,
  isValid,
  authPassword.requestResetPasswordMail
);

// PATCH auth/password/reset/{resetToken}
router.patch(
  "/reset/:resetToken",
  fieldValidator.password,
  isValid,
  authPassword.resetPassword
);

export default router;
