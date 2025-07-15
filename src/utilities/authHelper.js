import * as JwtHelper from "./jwtHelper.js";
import { getSafeData } from "./dataHelper.js";
import AppError from "./appError.js";

export const generateTokensForUser = async (user) => {
  const userSafeData = getSafeData(user);

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  const refreshToken = JwtHelper.createRefreshToken({ _id: user._id });

  user.refreshTokens.push(refreshToken);

  return { accessToken, refreshToken, userSafeData };
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
