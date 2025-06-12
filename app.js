import dotenv from "dotenv";
import express from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import jsend from "./middlewares/jsend.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(jsend());

app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/", userRouter);

app.use((req, res) => {
  res.jsend.fail({ url: "Source location not found" }, 404);
});
app.use((err, req, res, next) => {
  res.jsend.error(err.message);
});

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
connect(MONGODB_URI)
  .then(() => app.listen(PORT))
  .then(() => console.log(`server is running on port ${PORT}`))
  .catch((err) => console.error(err));
