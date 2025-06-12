import bcrypt from "bcrypt";

import User from "../models/user.js";
import jwtHelper from "../utilities/jwtHelper.js";

export const postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExisted = await User.findOne({ email });
  if (userExisted)
    return res.jsend.fail({ email: "Email already in use" }, 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({ name, email, password: hashedPassword });
  const user = await newUser.save();
  const userSafeData = jwtHelper.getSafeData(user);

  res.jsend.success({ user: userSafeData });
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.jsend.fail({ email: "Invalid email" }, 401);

  const matchedPasswords = await bcrypt.compare(password, user.password);
  if (!matchedPasswords)
    return res.jsend.fail({ password: "Invalid password" }, 401);

  const userSafeData = jwtHelper.getSafeData(user);
  const refreshToken = jwtHelper.createRefreshToken(userSafeData);
  jwtHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = jwtHelper.createAccessToken(userSafeData);
  res.jsend.success({ accessToken, user: userSafeData });
};

export const postRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.jsend.fail({ refreshToken: "No refreshToken exist" }, 401);

  let userId;
  try {
    const decoded = jwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    return res.jsend.fail(
      {
        refreshToken:
          err.name === "TokenExpiredError"
            ? "Refresh token expired"
            : "Refresh token invalid",
      },
      403
    );
  }

  const user = await User.findById(userId);
  if (!user) return res.jsend.fail({ user: "User not found" }, 401);

  const refreshTokenIndex = user.refreshTokens.findIndex(
    (rf) => rf === refreshToken
  );
  if (refreshTokenIndex === -1)
    return res.jsend.fail({ refreshTokens: "Invalid refresh token" }, 403);

  const userSafeData = jwtHelper.getSafeData(user);
  const newRefreshToken = jwtHelper.createRefreshToken(userSafeData);
  jwtHelper.createRefreshTokenCookie(res, newRefreshToken);

  user.refreshTokens[refreshTokenIndex] = newRefreshToken;
  await user.save();

  const newAccessToken = jwtHelper.createAccessToken(userSafeData);
  res.jsend.success({ accessToken: newAccessToken });
};

export const postLogout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.jsend.success();
  }

  let userId;
  try {
    const decoded = jwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    jwtHelper.clearRefreshTokenCookie(res);
    return res.jsend.success();
  }

  const user = await User.findById(userId);
  if (!user) return res.jsend.fail({ user: "User not found" }, 401);

  const logoutFullCase = req.query.full;
  if (!logoutFullCase)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  else user.refreshTokens = [];
  await user.save();

  jwtHelper.clearRefreshTokenCookie(res);
  res.jsend.success();
};
