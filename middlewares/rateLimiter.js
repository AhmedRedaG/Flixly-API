import rateLimit from "express-rate-limit";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: "error",
    message: "Too many attempts, please try again after 15 minutes",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export default authRateLimiter;
