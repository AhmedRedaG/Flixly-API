import { Router } from "express";

const router = Router();

router.get("/upload", (req, res) => {
  res.render("upload", { title: "Flixly Uploader" });
});

export default router;
