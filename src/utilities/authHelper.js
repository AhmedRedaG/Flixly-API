import * as JwtHelper from "./jwtHelper.js";
import { getSafeData } from "./dataHelper.js";

export const generateTokensForUser = async (user) => {
  const userSafeData = getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);

  user.refreshTokens.push(refreshToken);

  const accessToken = JwtHelper.createAccessToken(userSafeData);

  return { accessToken, refreshToken, userSafeData };
};
