import rateLimit from "express-rate-limit";

import * as configs from "../../config/index.js";

const { WINDOW_DURATION, REQUESTS_BARE_WINDOW } = configs.constants.rateLimit;

const rateLimiter = rateLimit({
  windowMs: WINDOW_DURATION,
  max: REQUESTS_BARE_WINDOW,
  message: {
    status: "error",
    message: "Too many attempts, please try again after 15 minutes",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export default rateLimiter;
