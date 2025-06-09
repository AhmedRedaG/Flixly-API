import { Router } from "express";

import { getUser } from "../controllers/user.js";

import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.get("/users/", isAuth, getUser);

export default router;
