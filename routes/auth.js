import { Router } from "express";

import { postRegister, postLogin } from "../controllers/auth.js";

import validationResult, * as validation from "../middlewares/validation.js";

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
  postRegister
);

router.post(
  "/login",
  [validation.email, validation.password, validationResult],
  postLogin
);

export default router;
