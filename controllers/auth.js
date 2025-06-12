import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

import {
  getSafeData,
  clearRefreshTokenCookie,
  createRefreshTokenCookie,
} from "../utilities/authHelper.js";

export const postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExisted = await User.findOne({ email });
  if (userExisted)
    return res.jsend.fail({ email: "Email already in use" }, 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({ name, email, password: hashedPassword });
  const user = await newUser.save();
  const userSafeData = getSafeData(user);

  res.jsend.success({ user: userSafeData });
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.jsend.fail({ email: "Invalid email" }, 401);

  const matchedPasswords = await bcrypt.compare(password, user.password);
  if (!matchedPasswords)
    return res.jsend.fail({ password: "Invalid password" }, 401);

  const userSafeData = getSafeData(user);
  const refreshToken = jwt.sign(
    userSafeData,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
  createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  const saveNewRefreshToken = await user.save();

  const accessToken = jwt.sign(userSafeData, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  res.jsend.success({ accessToken, user: userSafeData });
};

export const postRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.jsend.fail({ refreshToken: "No refreshToken exist" }, 401);

  let userId;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
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

  const userSafeData = getSafeData(user);
  const newRefreshToken = jwt.sign(
    userSafeData,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
  createRefreshTokenCookie(res, newRefreshToken);

  user.refreshTokens[refreshTokenIndex] = newRefreshToken;
  await user.save();

  const newAccessToken = jwt.sign(
    userSafeData,
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
  res.jsend.success({ accessToken: newAccessToken });
};

export const postLogout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.jsend.success();
  }

  let userId;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    userId = decoded._id;
  } catch (err) {
    clearRefreshTokenCookie(res);
    return res.jsend.success();
  }

  const user = await User.findById(userId);
  if (!user) return res.jsend.fail({ user: "User not found" }, 401);

  const logoutFullCase = req.query.full;
  if (!logoutFullCase)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  else user.refreshTokens = [];
  await user.save();

  clearRefreshTokenCookie(res);
  res.jsend.success();
};
