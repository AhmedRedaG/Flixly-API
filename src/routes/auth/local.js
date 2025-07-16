import { Router } from "express";

import * as authLocal from "../../controllers/auth/local.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";

const router = Router();

// POST auth/local/register
router.post(
  "/register",
  authValidator.register,
  isValid,
  authLocal.postRegister
);

// POST auth/local/verify/{verifyToken}
router.post("/verify/:verifyToken", authLocal.verifyMail);

// POST auth/local/login
router.post("/login", authValidator.login, isValid, authLocal.postLogin);

// POST auth/local/refresh
router.post("/refresh", authLocal.postRefresh);

// DELETE auth/local/logout
router.delete("/logout", authLocal.postLogout);

export default router;
