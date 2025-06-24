import bcrypt from "bcrypt";

import User from "../../models/user.js";
import JwtHelper from "../../utilities/JwtHelper.js";
import CookieHelper from "../../utilities/cookieHelper.js";
import { sendResetPasswordMail } from "../../utilities/mailSender.js";

export const patchChangePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return res.jsend.fail({ user: "User not found" }, 404);

  const matchedPasswords = await bcrypt.compare(oldPassword, user.password);
  if (!matchedPasswords)
    return res.jsend.fail({ oldPassword: "Old password is wrong" }, 401);

  if (newPassword === oldPassword)
    return res.jsend.fail({
      newPassword: "New password must be different from old password",
    });

  const newHashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = newHashedPassword;
  user.refreshTokens = [];
  await user.save();

  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success({ message: "Password has been successfully changed." });
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

  if (user.resetToken === resetToken)
    return res.jsend.fail({ resetToken: "Reset token is already used" }, 403);

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.resetToken = resetToken;
  user.refreshTokens = [];
  await user.save();

  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success({ message: "Password has been successfully reset." });
};
