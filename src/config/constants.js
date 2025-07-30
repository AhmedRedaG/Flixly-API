import rateLimit from "express-rate-limit";

export const constants = {
  jwt: {
    ACCESS_TOKEN_AGE: "15m",
    REFRESH_TOKEN_AGE: "7d",
    REFRESH_TOKEN_AGE_COOKIE: 7 * 24 * 60 * 60 * 1000, // = 7d
    RESET_TOKEN_AGE: "1h",
    TEMP_TOKEN_AGE: "10m",
    VERIFY_TOKEN_AGE: "3h",
  },

  bcrypt: {
    HASH_PASSWORD_ROUNDS: 12,
    HASH_BACKUP_CODES_ROUNDS: 10,
  },

  rateLimit: {
    WINDOW_DURATION: 1000 * 60 * 15,
    REQUESTS_BARE_WINDOW: 50,
  },
};
