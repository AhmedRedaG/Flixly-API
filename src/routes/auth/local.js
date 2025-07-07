import { Router } from "express";

import * as authLocal from "../../controllers/auth/local.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";

const router = Router();

// auth/local/register
router.post(
  "/register",
  authValidator.register,
  isValid,
  authLocal.postRegister
);

// auth/local/verify/{verifyToken}
router.patch("/verify/:verifyToken", authLocal.verifyMail);

// auth/local/login
router.post("/login", authValidator.login, isValid, authLocal.postLogin);

// auth/local/refresh
router.post("/refresh", authLocal.postRefresh);

// auth/local/logout
router.delete("/logout", authLocal.postLogout);

export default router;
