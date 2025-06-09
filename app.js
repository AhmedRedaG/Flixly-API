import dotenv from "dotenv";
import express from "express";
import { connect } from "mongoose";

import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/v1/", authRouter);

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
connect(MONGODB_URI)
  .then(() => app.listen(PORT))
  .then(() => console.log(`server is running on port ${PORT}`))
  .catch((err) => console.error(err));
