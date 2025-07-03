import jwt from "jsonwebtoken";

import * as configs from "./../config/index.js";

const { ACCESS_TOKEN_AGE, REFRESH_TOKEN_AGE, RESET_TOKEN_AGE, TEMP_TOKEN_AGE } =
  configs.constants.jwt;

const {
  accessTokenSecret,
  refreshTokenSecret,
  resetTokenSecret,
  tempTokenSecret,
} = configs.env.jwt;

const createToken = (payload, key, expiresIn) => {
  return jwt.sign(payload, key, { expiresIn });
};

export const createAccessToken = (payload) => {
  return createToken(payload, accessTokenSecret, ACCESS_TOKEN_EXPIRES_IN);
};
export const createRefreshToken = (payload) => {
  return createToken(payload, refreshTokenSecret, REFRESH_TOKEN_EXPIRES_IN);
};
export const createResetToken = (payload) => {
  return createToken(payload, resetTokenSecret, RESET_TOKEN_EXPIRES_IN);
};
export const createTempToken = (payload) => {
  return createToken(payload, tempTokenSecret, TEMP_TOKEN_EXPIRES_IN);
};

const verifyToken = (token, key) => {
  return jwt.verify(token, key);
};

export const verifyAccessToken = (token) => {
  return verifyToken(token, accessTokenSecret);
};
export const verifyRefreshToken = (token) => {
  return verifyToken(token, refreshTokenSecret);
};
export const verifyResetToken = (token) => {
  return verifyToken(token, resetTokenSecret);
};
export const verifyTempToken = (token) => {
  return verifyToken(token, tempTokenSecret);
};
