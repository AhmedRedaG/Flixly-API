import User from "../../models/user.js";
import * as JwtHelper from "../../utilities/JwtHelper.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";
import AppError from "../../utilities/AppError.js";

export const authWithGoogleService = async (googleId) => {
  const user = await User.findOne({ googleId });
  if (!user) throw new AppError("Invalid googleId", 401);

  if (user.TFA.status === true) {
    const tempToken = JwtHelper.createTempToken({ _id: user._id });
    return { method: user.TFA.method, tempToken };
  }

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);

  return { accessToken, user: userSafeData };
};
