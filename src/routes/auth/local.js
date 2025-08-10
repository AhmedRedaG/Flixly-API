import { Router } from "express";

import * as authController from "../../controllers/auth.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";
import { idParam } from "../../validators/common.js";

const router = Router();

// POST auth/local/register
router.post(
  "/register",
  authValidator.register,
  isValid,
  authController.register
);

// PATCH auth/local/verify/{verifyToken}
router.patch(
  "/verify/:verifyToken",
  ...idParam("verifyToken"),
  isValid,
  authController.verifyMail
);

// POST auth/local/login
router.post("/login", authValidator.login, isValid, authController.login);

// POST auth/local/refresh
router.post("/refresh", authController.refresh);

// DELETE auth/local/logout
router.delete("/logout", authController.logout);

export default router;
