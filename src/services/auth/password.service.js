import bcrypt from "bcrypt";

import User from "../../models/user.js";
import * as JwtHelper from "../../utilities/JwtHelper.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";
import { sendResetPasswordMail } from "../../utilities/mailSender.js";
import { getUserByIdOrFail } from "../../utilities/dbHelper.js";
import AppError from "../../utilities/AppError.js";

export const changePasswordService = async (
  userId,
  oldPassword,
  newPassword,
  TFACode
) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.status === true) {
    if (!TFACode) throw new AppError("2FA code is required", 401);

    await verifyTFACode(user, TFACode, user.TFA.method);
  }

  const matchedPasswords = await bcrypt.compare(oldPassword, user.password);
  if (!matchedPasswords) throw new AppError("Old password is wrong", 401);

  if (newPassword === oldPassword)
    throw new AppError("New password must be different from old password");

  const newHashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = newHashedPassword;
  user.refreshTokens = [];
  await user.save();

  CookieHelper.clearRefreshTokenCookie(res);

  return { message: "Password has been successfully changed." };
};

export const requestPasswordResetService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid email", 401);

  const payload = {
    _id: user._id,
    email: user.email,
    type: "reset",
  };
  const resetToken = JwtHelper.createResetToken(payload);

  const sendMailResult = await sendResetPasswordMail(user, resetToken);

  return { message: sendMailResult };
};

export const resetPasswordService = async (resetToken, password) => {
  if (!resetToken) throw new AppError("Reset token is missing");

  let userId;
  try {
    const decoded = JwtHelper.verifyResetToken(resetToken);
    if (decoded.type === "reset") userId = decoded._id;
    else throw new AppError("Invalid Token Type");
  } catch (err) {
    throw new AppError("Reset token is expired or invalid", 401);
  }

  const user = await getUserByIdOrFail(userId);

  if (user.resetToken === resetToken)
    throw new AppError("Reset token is already used", 403);

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.resetToken = resetToken;
  user.refreshTokens = [];
  await user.save();

  CookieHelper.clearRefreshTokenCookie(res);

  return { message: "Password has been successfully reset." };
};
