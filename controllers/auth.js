import bcrypt from "bcrypt";

import User from "../models/user.js";
import JwtHelper from "../utilities/JwtHelper.js";
import CookieHelper from "../utilities/CookieHelper.js";
import { sendResetPasswordMail } from "../utilities/mailSender.js";

export const postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExisted = await User.findOne({ email });
  if (userExisted)
    return res.jsend.fail({ email: "Email already in use" }, 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({ name, email, password: hashedPassword });
  const user = await newUser.save();
  const userSafeData = JwtHelper.getSafeData(user);

  res.jsend.success({ user: userSafeData });
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.jsend.fail({ email: "Invalid email" }, 401);

  const matchedPasswords = await bcrypt.compare(password, user.password);
  if (!matchedPasswords)
    return res.jsend.fail({ password: "Invalid password" }, 401);

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  res.jsend.success({ accessToken, user: userSafeData });
};

export const authWithGoogle = async (req, res, next) => {
  const userGoogleId = req.user; // google id only
  const user = await User.findOne({ googleId: userGoogleId });

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  // res.redirect(`http://frontend/oauth-success?token=${accessToken}`);
  res.jsend.success({ accessToken, user: userSafeData });
};

export const postRequestPasswordReset = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.jsend.fail({ email: "Invalid email" }, 401);

  const payload = {
    _id: user._id,
    email: user.email,
    type: "reset",
  };
  const resetToken = JwtHelper.createResetToken(payload);

  const sendMailResult = await sendResetPasswordMail(user, resetToken);
  res.jsend.success({ message: sendMailResult });
};

export const patchResetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!resetToken)
    return res.jsend.fail({ resetToken: "Reset token is missing" });

  let userId;
  try {
    const decoded = JwtHelper.verifyResetToken(resetToken);
    if (decoded.type === "reset") userId = decoded._id;
    else throw new Error("Invalid Token Type");
  } catch (err) {
    return res.jsend.fail(
      { resetToken: "Reset token is expired or invalid" },
      401
    );
  }

  const user = await User.findById(userId);
  if (!user) return res.jsend.fail({ user: "User not found" }, 404);

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.refreshTokens = [];
  await user.save();

  res.jsend.success({ message: "Password has been successfully reset." });
};

export const postRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.jsend.fail({ refreshToken: "No refreshToken exist" }, 401);

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(refreshToken);
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
  if (!user) return res.jsend.fail({ user: "User not found" }, 404);

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
  res.jsend.success({ accessToken: newAccessToken });
};

export const postLogout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.jsend.success();
  }

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    CookieHelper.clearRefreshTokenCookie(res);
    return res.jsend.success();
  }

  const user = await User.findById(userId);
  if (!user) return res.jsend.fail({ user: "User not found" }, 404);

  const logoutFullCase = req.query.full;
  if (!logoutFullCase)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  else user.refreshTokens = [];
  await user.save();

  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success();
};
