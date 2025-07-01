import * as JwtHelper from "./jwtHelper.js";
import { getSafeData } from "./dataHelper.js";

export const generateTokensForUser = async (user) => {
  const userSafeData = getSafeData(user);

  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  const accessToken = JwtHelper.createAccessToken(userSafeData);

  user.refreshTokens.push(refreshToken);

  return { accessToken, refreshToken, userSafeData };
};
