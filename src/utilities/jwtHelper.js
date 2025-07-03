import jwt from "jsonwebtoken";

import * as configs from "./../config/index.js";

const ACCESS_TOKEN_EXPIRES_IN = "2h"; // for testing
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const RESET_TOKEN_EXPIRES_IN = "1h";
const TEMP_TOKEN_EXPIRES_IN = "10m";

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
