import { Router } from "express";
import { db } from "../../database/models/index.js";

const router = Router();

router.get("/upload", (req, res) => {
  res.render("upload", { title: "Flixly Uploader" });
});

router.get("/video/:id", async (req, res) => {
  res.render("video-preview", {
    title: `Flixly Video`,
    videoId: req.params.id,
  });
});

export default router;
