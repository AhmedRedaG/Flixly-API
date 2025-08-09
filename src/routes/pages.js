import { Router } from "express";
import { db } from "../../database/models/index.js";
import isValid from "../middlewares/isValid.js";
import * as pagesValidator from "../validators/shared/pages.js";

const router = Router();

router.get("/upload", (req, res) => {
  res.render("upload", { title: "Flixly Uploader" });
});

router.get(
  "/video/:id",
  pagesValidator.videoIdPath,
  isValid,
  async (req, res) => {
    res.render("video-preview", {
      title: `Flixly Video`,
      videoId: req.params.id,
    });
  }
);

export default router;
