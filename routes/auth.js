import { Router } from "express";

import * as authController from "../controllers/auth.js";

import validationResult, * as validation from "../middlewares/isValid.js";
import rateLimiter from "../middlewares/rateLimiter.js";

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
  authController.postRegister
);

router.post(
  "/login",
  rateLimiter,
  [validation.email, validation.password, validationResult],
  authController.postLogin
);

router.post("/refresh", rateLimiter, authController.postRefresh);

router.post("/logout", authController.postLogout);

export default router;
