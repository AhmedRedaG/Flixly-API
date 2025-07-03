import * as configs from "./../config/index.js";

const { REFRESH_TOKEN_AGE } = configs.constants.jwt;

export function createRefreshTokenCookie(refreshToken, res) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
    maxAge: REFRESH_TOKEN_AGE,
  });
}

export function clearRefreshTokenCookie(res) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
  });
}
