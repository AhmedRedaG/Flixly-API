import { Router } from "express";

import * as authController from "../../controllers/auth.js";
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
  authController.requestResetPasswordMail
);

// PATCH auth/password/reset/{resetToken}
router.patch(
  "/reset/:resetToken",
  ...idParam("resetToken"),
  ...strongPasswordBody("password"),
  isValid,
  authController.resetPassword
);

export default router;
