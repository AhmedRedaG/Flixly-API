import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5555, // for testing
  message: {
    status: "error",
    message: "Too many attempts, please try again after 15 minutes",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
