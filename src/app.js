import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import jsendMiddleware from "jsend-middleware";
import cors from "cors";

import "../config/passport.js";
import authRouter from "./routes/auth/index.js";
import userRouter from "./routes/user.js";
import channelRouter from "./routes/channel.js";
import videoRouter from "./routes/video.js";
import commentRouter from "./routes/comment.js";
import tagRouter from "./routes/tag.js";
import uploadRouter from "./routes/upload.js";
import pagesRouter from "./routes/pages.js";
import rateLimiter from "./middlewares/rateLimiter.js";
import requestDurationLogger from "./middlewares/requestDurationLogger.js";
import errorHandler from "./middlewares/errorHandler.js";
import { swaggerMiddlewares } from "./middlewares/swaggerDocs.js";

const app = express();

app.use(cors());
app.use(jsendMiddleware());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));
app.use(express.static(path.join(process.cwd(), "public")));

app.use(rateLimiter);
app.use(requestDurationLogger);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/pages", pagesRouter);
app.use("/docs", swaggerMiddlewares);
app.use(errorHandler);

export default app;
