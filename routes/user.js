import { Router } from "express";

import { getUser, setPhoneNumber } from "../controllers/user.js";
import validationResult, * as validation from "../middlewares/isValid.js";

import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.get("/users", isAuth, getUser);

router.put(
  "/users/phone-number",
  isAuth,
  [validation.phoneNumber, validationResult],
  setPhoneNumber
);

export default router;
