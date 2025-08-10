import logger from "../../config/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const end = Date.now();
    const duration = end - start;

    if (res.statusCode >= 500) {
      return;
    }
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger.log(
      logLevel,
      `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
      {
        ip: req.ip,
        method: req.method,
        originalUrl: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get("User-Agent"),
        contentLength: res.get("Content-Length"),
        error: res?.body?.data?.message,
      }
    );
  });

  next();
};

export default requestLogger;
