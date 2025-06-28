import { Router } from "express";

import * as authNormal from "../../controllers/auth/local.js";
import validationResult, * as validation from "../../middlewares/isValid.js";
import rateLimiter from "../../middlewares/rateLimiter.js";

const router = Router();

// auth/local/register/
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
  authNormal.postRegister
);

// auth/local/login/
router.post(
  "/login",
  rateLimiter,
  [validation.email, validation.password, validationResult],
  authNormal.postLogin
);

// auth/local/refresh/
router.post("/refresh", rateLimiter, authLocals.postRegister);

// auth/local/logout/
router.delete("/logout", authNormal.postLogout);

export default router;
