import bcrypt from "bcrypt";

import User from "../../models/user.js";
import * as JwtHelper from "../../utilities/JwtHelper.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";
import { getUserByIdOrFail } from "../../utilities/dbHelper.js";

export const postRegisterService = async (name, email, password) => {
  const userExisted = await User.findOne({ email });
  if (userExisted) throw new AppError("Email already in use", 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({ name, email, password: hashedPassword });
  const user = await newUser.save();
  const userSafeData = JwtHelper.getSafeData(user);

  return { user: userSafeData };
};

export const postLoginService = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid email", 401);

  if (!user.password)
    throw new AppError("This account was registered with Google.", 401);

  const matchedPasswords = await bcrypt.compare(password, user.password);
  if (!matchedPasswords) throw new AppError("Invalid password", 401);

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

export const postRefreshService = async (refreshToken) => {
  if (!refreshToken) throw new AppError("No refreshToken exist", 401);

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    throw new AppError(
      err.name === "TokenExpiredError"
        ? "Refresh token expired"
        : "Refresh token invalid",
      403
    );
  }

  const user = await getUserByIdOrFail(userId);

  const refreshTokenIndex = user.refreshTokens.findIndex(
    (rf) => rf === refreshToken
  );
  if (refreshTokenIndex === -1)
    return res.jsend.fail({ refreshTokens: "Invalid refresh token" }, 403);

  const userSafeData = JwtHelper.getSafeData(user);
  const newRefreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, newRefreshToken);

  user.refreshTokens[refreshTokenIndex] = newRefreshToken;
  user.refreshTokens = user.refreshTokens.slice(-5);
  await user.save();

  const newAccessToken = JwtHelper.createAccessToken(userSafeData);

  return { accessToken: newAccessToken };
};

// need refactor
export const postLogoutService = async (refreshToken, logoutFullCase) => {
  if (!refreshToken) return;

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    CookieHelper.clearRefreshTokenCookie(res);
    return;
  }

  const user = await getUserByIdOrFail(userId);

  if (!logoutFullCase)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  else user.refreshTokens = [];
  await user.save();

  CookieHelper.clearRefreshTokenCookie(res);

  return;
};
