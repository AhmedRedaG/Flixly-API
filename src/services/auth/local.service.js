import bcrypt from "bcrypt";

import User from "../../models/user.js";
import AppError from "../../utilities/appError.js";
import * as JwtHelper from "../../utilities/jwtHelper.js";
import { generateTokensForUser } from "../../utilities/authHelper.js";
import { getUserByIdOrFail, getSafeData } from "../../utilities/dataHelper.js";
import * as configs from "../../config/index.js";

const { HASH_PASSWORD_ROUNDS } = configs.constants.bcrypt;

export const postRegisterService = async (name, email, password) => {
  const userExisted = await User.findOne({ email });
  if (userExisted) throw new AppError("Email already in use", 409);

  const hashedPassword = await bcrypt.hash(password, HASH_PASSWORD_ROUNDS);
  const newUser = new User({ name, email, password: hashedPassword });
  const user = await newUser.save();
  const userSafeData = getSafeData(user);

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

  const { accessToken, refreshToken, userSafeData } =
    await generateTokensForUser(user);
  await user.save();

  return { accessToken, refreshToken, userSafeData };
};

export const postRefreshService = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw new AppError("No oldRefreshToken exist", 401);

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(oldRefreshToken);
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
    (rf) => rf === oldRefreshToken
  );
  if (refreshTokenIndex === -1)
    throw new AppError("Invalid refresh token", 403);

  const { accessToken, refreshToken } = await generateTokensForUser(user);

  user.refreshTokens[refreshTokenIndex] = refreshToken;
  user.refreshTokens = user.refreshTokens.slice(-5);
  await user.save();

  return { accessToken, refreshToken };
};

export const postLogoutService = async (refreshToken, logoutFullCase) => {
  if (!refreshToken) return;

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    throw new AppError("Invalid or expired token");
  }

  const user = await getUserByIdOrFail(userId);

  if (!logoutFullCase)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  else user.refreshTokens = [];
  await user.save();

  return;
};
