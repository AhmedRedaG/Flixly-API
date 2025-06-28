import express from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import jsendMiddleware from "jsend-middleware";
import helmet from "helmet";
import cors from "cors";
import passport from "passport";

import "./config/passport.js";
import authRouter from "./routes/auth/index.js";
import userRouter from "./routes/user.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use(jsendMiddleware());

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const end = Date.now();
    const duration = end - start;

    console.log(`${req.ip} ${req.method} ${req.originalUrl} => ${duration}ms`);
  });

  next();
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use((req, res) => {
  res.jsend.fail({ url: "Source location not found" }, 404);
});
app.use((err, req, res, next) => {
  console.log(err);
  res.jsend.error(err.message);
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
connect(MONGODB_URI)
  .then(() => app.listen(PORT))
  .then(() => console.log(`server is running on port ${PORT}`))
  .catch((err) => console.error(err));
