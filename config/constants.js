import rateLimit from "express-rate-limit";

export const constants = {
  jwt: {
    ACCESS_TOKEN_AGE: "15h", // for testing
    REFRESH_TOKEN_AGE: "7d",
    VERIFY_TOKEN_AGE: "3h",
    REFRESH_TOKEN_AGE_IN_MS: 7 * 24 * 60 * 60 * 1000,
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
    SHORT_USER_FIELDS: ["id", "username", "firstName", "lastName", "avatar"],
  },

  video: {
    PRIVATE_VIDEO_FIELDS: ["processing_status", "processing_message"],
    SHORT_VIDEO_FIELDS: [
      "id",
      "channel_id",
      "title",
      "thumbnail",
      "views_count",
      "duration",
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

  upload: {
    MAX_IMAGE_SIZE: 1024 * 1024 * 5,
    MAX_VIDEO_SIZE: 1024 * 1024 * 10, // 10M free cloudinary plane
    ALLOWED_IMAGE_TYPES: ["jpg", "jpeg", "png", "gif", "webp"],
    ALLOWED_VIDEO_TYPES: ["mp4", "mov", "avi", "mkv", "webm"],
    CLOUDINARY_UPLOAD_TIMEOUT: 10 * 60 * 1000, // 10 minutes
  },

  otp: {
    OTP_MIN: 100_000,
    OTP_MAX: 999_999,
    BASE_BACKOFF_MINUTES: 4,
    ALLOWED_OTP_TRIES: 5,
    OTP_EXPIRES_AFTER_IN_MS: 5 * 60 * 1000, // 5 minutes
  },
};
