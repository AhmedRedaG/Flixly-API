import * as configs from "../../config/index.js";

const { REFRESH_TOKEN_AGE_IN_MS } = configs.constants.jwt;

export const createRefreshTokenCookie = (refreshToken, res) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
    maxAge: REFRESH_TOKEN_AGE_IN_MS,
  });
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
  });
};
