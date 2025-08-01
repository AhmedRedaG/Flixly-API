import * as JwtHelper from "./jwtHelper.js";
import { getSafeData } from "./dataHelper.js";
import AppError from "./appError.js";

import * as configs from "../../config/index.js";

const { REFRESH_TOKEN_AGE_IN_MS } = configs.constants.jwt;

export const generateTokensForUser = async (userId) => {
  const accessToken = JwtHelper.createAccessToken({ id: userId });
  const refreshToken = JwtHelper.createRefreshToken({ id: userId });

  await user.createRefreshToken({
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_AGE_IN_MS),
  });

  return { accessToken, refreshToken };
};

export const extractAuthorizationHeader = (req) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw new AppError("Authorization header is missing", 401);
  }
  if (!authorizationHeader.startsWith("Bearer ")) {
    throw new AppError("Invalid Authorization format", 401);
  }

  const token = authorizationHeader.split(" ")[1];

  return token;
};
