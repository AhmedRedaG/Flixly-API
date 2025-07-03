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

function createToken(payload, key, expiresIn) {
  return jwt.sign(payload, key, { expiresIn });
}

export function createAccessToken(payload) {
  return createToken(payload, accessTokenSecret, ACCESS_TOKEN_EXPIRES_IN);
}
export function createRefreshToken(payload) {
  return createToken(payload, refreshTokenSecret, REFRESH_TOKEN_EXPIRES_IN);
}
export function createResetToken(payload) {
  return createToken(payload, resetTokenSecret, RESET_TOKEN_EXPIRES_IN);
}
export function createTempToken(payload) {
  return createToken(payload, tempTokenSecret, TEMP_TOKEN_EXPIRES_IN);
}

function verifyToken(token, key) {
  return jwt.verify(token, key);
}

export function verifyAccessToken(token) {
  return verifyToken(token, accessTokenSecret);
}
export function verifyRefreshToken(token) {
  return verifyToken(token, refreshTokenSecret);
}
export function verifyResetToken(token) {
  return verifyToken(token, resetTokenSecret);
}
export function verifyTempToken(token) {
  return verifyToken(token, tempTokenSecret);
}
