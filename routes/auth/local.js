import { Router } from "express";

import * as authLocal from "../../controllers/auth/local.js";
import validationResult, * as validation from "../../middlewares/isValid.js";
import rateLimiter from "../../middlewares/rateLimiter.js";

const router = Router();

// auth/local/register
router.post(
  "/register",
  rateLimiter,
  [
    validation.name,
    validation.email,
    validation.password,
    validation.confirmPassword,
    validationResult,
  ],
  authLocal.postRegister
);

// auth/local/login
router.post(
  "/login",
  rateLimiter,
  [validation.email, validation.password, validationResult],
  authLocal.postLogin
);

// auth/local/refresh
router.post("/refresh", rateLimiter, authLocal.postRefresh);

// auth/local/logout
router.delete("/logout", authLocal.postLogout);

export default router;
