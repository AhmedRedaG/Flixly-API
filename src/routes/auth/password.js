import { Router } from "express";

import * as authPassword from "../../controllers/auth/password.js";
import isValid from "../../middlewares/isValid.js";
import {
  emailBody,
  strongPasswordBody,
  idParam,
} from "../../validators/common.js";

const router = Router();

// POST auth/password/reset
router.post(
  "/reset",
  ...emailBody,
  isValid,
  authPassword.requestResetPasswordMail
);

// PATCH auth/password/reset/{resetToken}
router.patch(
  "/reset/:resetToken",
  ...idParam("resetToken"),
  ...strongPasswordBody("password"),
  isValid,
  authPassword.resetPassword
);

export default router;
