import rateLimit from "express-rate-limit";

export const constants = {
  jwt: {
    ACCESS_TOKEN_AGE: "15h", // for testing
    REFRESH_TOKEN_AGE: "7d",
    REFRESH_TOKEN_AGE_IN_MS: 7 * 24 * 60 * 60 * 1000,
    RESET_TOKEN_AGE: "1h",
    RESET_TOKEN_AGE_IN_MS: 60 * 60 * 1000,
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

  user: {
    PRIVATE_USER_FIELDS: [
      "email",
      "googleId",
      "password",
      "verified",
      "updated_at",
    ],
  },

  video: {
    PRIVATE_VIDEO_FIELDS: ["processing_status", "processing_message"],
    SHORT_VIDEO_FIELDS: [
      "id",
      "channel_id",
      "title",
      "thumbnail",
      "views_count",
      "publish_at",
    ],
  },

  channel: {
    SHORT_CHANNEL_FIELDS: [
      "id",
      "username",
      "name",
      "avatar",
      "subscribers",
      "created_at",
    ],
  },
};
