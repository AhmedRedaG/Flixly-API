import dotenv from "dotenv";
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV.trim() || "development",
  port: {
    development: process.env.DEVELOPMENT_PORT || 3000,
    testing: process.env.TESTING_PORT || 3030,
  },
  mongoUri: {
    development: process.env.DEVELOPMENT_MONGODB_URI,
    testing: process.env.TESTING_MONGODB_URI,
  },

  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    resetTokenSecret: process.env.RESET_TOKEN_SECRET,
    tempTokenSecret: process.env.TEMP_TOKEN_SECRET,
    verifyTokenSecret: process.env.VERIFY_TOKEN_SECRET,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  email: {
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: process.env.SMTP_PORT || 587,
    serverEmail: process.env.SERVER_MAIL,
    serverEmailPass: process.env.SERVER_MAIL_PASS,
    supportEmail: process.env.SUPPORT_MAIL || process.env.SERVER_MAIL,
  },

  frontendUrl: process.env.FRONTEND_URL,
};
