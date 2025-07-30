import express from "express";

import localRouter from "./local.js";
import googleRouter from "./google.js";
import passwordRouter from "./password.js";

const router = express.Router();

router.use("/local", localRouter);
router.use("/google", googleRouter);
router.use("/password", passwordRouter);

export default router;
