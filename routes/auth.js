import { Router } from "express";

import * as authController from "../controllers/auth.js";

import validationResult, * as validation from "../middlewares/isValid.js";

const router = Router();

router.post(
  "/register",
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
  [validation.email, validation.password, validationResult],
  authController.postLogin
);

router.post("/refresh", authController.postRefresh);

router.post("/logout", authController.postLogout);

export default router;
