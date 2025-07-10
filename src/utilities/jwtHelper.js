import jwt from "jsonwebtoken";

import * as configs from "./../config/index.js";
import AppError from "./appError.js";

const TOKEN_TYPES = {
  ACCESS: {
    secret: configs.env.jwt.accessTokenSecret,
    expiresIn: configs.constants.jwt.ACCESS_TOKEN_AGE,
  },
  REFRESH: {
    secret: configs.env.jwt.refreshTokenSecret,
    expiresIn: configs.constants.jwt.REFRESH_TOKEN_AGE,
  },
  RESET: {
    secret: configs.env.jwt.resetTokenSecret,
    expiresIn: configs.constants.jwt.RESET_TOKEN_AGE,
  },
  TEMP: {
    secret: configs.env.jwt.tempTokenSecret,
    expiresIn: configs.constants.jwt.TEMP_TOKEN_AGE,
  },
  VERIFY: {
    secret: configs.env.jwt.verifyTokenSecret,
    expiresIn: configs.constants.jwt.VERIFY_TOKEN_AGE,
  },
};

const createToken = (payload, tokenType) => {
  const { secret, expiresIn } = TOKEN_TYPES[tokenType];
  if (!secret) throw new Error(`Missing secret for ${tokenType} token`);

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  });
};

const verifyToken = (token, tokenType) => {
  if (!token) throw new Error("Token is required");

  const { secret } = TOKEN_TYPES[tokenType];
  if (!secret) throw new Error(`Missing secret for ${tokenType} token`);

  try {
    return jwt.verify(token, secret, { algorithms: ["HS256"] });
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Access token expired"
        : err.name === "JsonWebTokenError"
        ? "Access token invalid"
        : "Authentication failed";

    throw new AppError(message, 403);
  }
};

export const createAccessToken = (payload) => createToken(payload, "ACCESS");
export const createRefreshToken = (payload) => createToken(payload, "REFRESH");
export const createResetToken = (payload) => createToken(payload, "RESET");
export const createTempToken = (payload) => createToken(payload, "TEMP");
export const createVerifyToken = (payload) => createToken(payload, "VERIFY");

export const verifyAccessToken = (token) => verifyToken(token, "ACCESS");
export const verifyRefreshToken = (token) => verifyToken(token, "REFRESH");
export const verifyResetToken = (token) => verifyToken(token, "RESET");
export const verifyTempToken = (token) => verifyToken(token, "TEMP");
export const verifyVerifyToken = (token) => verifyToken(token, "VERIFY");
