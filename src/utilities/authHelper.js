import * as JwtHelper from "./jwtHelper.js";
import { getSafeData } from "./dataHelper.js";

export const generateTokensForUser = async (user) => {
  const userSafeData = getSafeData(user);

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  const refreshToken = JwtHelper.createRefreshToken({ _id: user._id });

  user.refreshTokens.push(refreshToken);

  return { accessToken, refreshToken, userSafeData };
};
