import { Router } from "express";

import * as authLocal from "../../controllers/auth/local.js";
import isValid from "../../middlewares/isValid.js";
import * as authValidator from "../../validators/shared/auth.js";

const router = Router();

// POST auth/local/register
router.post("/register", authValidator.register, isValid, authLocal.register);

// PATCH auth/local/verify/{verifyToken}
router.patch("/verify/:verifyToken", authLocal.verifyMail);

// POST auth/local/login
router.post("/login", authValidator.login, isValid, authLocal.login);

// POST auth/local/refresh
router.post("/refresh", authLocal.refresh);

// DELETE auth/local/logout
router.delete("/logout", authLocal.logout);

export default router;
