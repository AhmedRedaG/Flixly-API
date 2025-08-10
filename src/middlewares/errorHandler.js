import AppError from "../utilities/appError.js";
import logger from "../../config/logger.js";

const notFoundError = (req, res) => {
  res.jsend.fail({ message: "Source location not found" }, 404);
};

const apiError = (err, req, res, next) => {
  if (err instanceof AppError) {
    const { message, statusCode } = err;
    res.jsend.fail({ message }, statusCode);
  } else {
    logger.error("unexpected error", {
      ip: req.ip,
      method: req.method,
      originalUrl: req.originalUrl,
      statusCode: res.statusCode,
      userAgent: req.get("User-Agent"),
      contentLength: res.get("Content-Length"),
      error: err.message,
      stack: err.stack,
    });

    console.error(err); // for dev
    res.jsend.error("Internal server error");
  }
};

const errorHandler = [notFoundError, apiError];
export default errorHandler;
