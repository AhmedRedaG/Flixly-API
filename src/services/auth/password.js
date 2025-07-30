import bcrypt from "bcrypt";

import User from "../../models/user.js";
import AppError from "../../utilities/appError.js";
import * as JwtHelper from "../../utilities/jwtHelper.js";
import { sendResetPasswordMail } from "../../utilities/mailHelper/mailSender.js";
import { getUserByIdOrFail } from "../../utilities/dataHelper.js";
import * as configs from "../../../config/index.js";

const { HASH_PASSWORD_ROUNDS } = configs.constants.bcrypt;

export const changePasswordService = async (
  userId,
  oldPassword,
  newPassword
) => {
  const user = await getUserByIdOrFail(userId);

  const matchedPasswords = await bcrypt.compare(oldPassword, user.password);
  if (!matchedPasswords) throw new AppError("Old password is wrong", 401);

  if (newPassword === oldPassword)
    throw new AppError("New password must be different from old password");

  const newHashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = newHashedPassword;
  user.refreshTokens = [];
  await user.save();

  return { message: "Password has been successfully changed." };
};

export const requestPasswordResetService = async (email) => {
  const user = await User.findOne({ email });
  if (!user)
    return {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };

  const resetToken = JwtHelper.createResetToken({ _id: use._id });

  await sendResetPasswordMail(user, resetToken);

  return {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
};

export const resetPasswordService = async (resetToken, password) => {
  const decoded = JwtHelper.verifyResetToken(resetToken);
  const userId = decoded._id;

  const user = await getUserByIdOrFail(userId);

  if (user.resetToken === resetToken)
    throw new AppError("Reset token is already used", 403);

  const hashedPassword = await bcrypt.hash(password, HASH_PASSWORD_ROUNDS);
  user.password = hashedPassword;
  user.resetToken = resetToken;
  user.refreshTokens = [];
  await user.save();

  return { message: "Password has been successfully reset." };
};
