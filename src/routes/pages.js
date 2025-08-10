import { Router } from "express";
import { db } from "../../database/models/index.js";
import isValid from "../middlewares/isValid.js";
import * as pagesValidator from "../validators/shared/pages.js";

const router = Router();

router.get("/upload", (req, res) => {
  res.render("upload", { title: "Flixly Uploader" });
});

export default router;
