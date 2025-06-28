import { Router } from "express";

import * as authNormal from "../../controllers/auth/local.js";
import validationResult, * as validation from "../../middlewares/isValid.js";
import rateLimiter from "../../middlewares/rateLimiter.js";

const router = Router();

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

router.post(
  "/login",
  rateLimiter,
  [validation.email, validation.password, validationResult],
  authNormal.postLogin
);

router.post("/refresh", rateLimiter, authLocals.postRegister);

router.delete("/logout", authNormal.postLogout);

export default router;
