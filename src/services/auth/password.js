import bcrypt from "bcrypt";

import { db } from "../../../database/models/index.js";
import AppError from "../../utilities/appError.js";
import * as JwtHelper from "../../utilities/jwtHelper.js";
import { sendResetPasswordMail } from "../../utilities/mailHelper/mailSender.js";
import { getUserByIdOrFail } from "../../utilities/dataHelper.js";
import * as configs from "../../../config/index.js";

const { HASH_PASSWORD_ROUNDS } = configs.constants.bcrypt;
const { RESET_TOKEN_AGE_IN_MS } = configs.constants.jwt;
const { User, ResetToken, RefreshToken } = db;

export const changePasswordService = async (
  userId,
  oldPassword,
  newPassword
) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User not found with the provided ID", 404);

  const matchedPasswords = await bcrypt.compare(oldPassword, user.password);
  if (!matchedPasswords) throw new AppError("Old password is wrong", 401);

  if (newPassword === oldPassword)
    throw new AppError("New password must be different from old password");

  const newHashedPassword = await bcrypt.hash(
    newPassword,
    HASH_PASSWORD_ROUNDS
  );
  user.password = newHashedPassword;
  await user.save();

  await RefreshToken.destroy({
    where: {
      user_id: user.id,
    },
  });

  return {
    message: "Password has been successfully changed. Please login again.",
  };
};

export const requestResetPasswordMailService = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    const resetToken = JwtHelper.createResetToken({ id: user.id });

    await user.createResetToken({
      token: resetToken,
      expiresAt: new Date(Date.now() + RESET_TOKEN_AGE_IN_MS),
    });

    // async mail request without await to avoid blocking I/O
    sendResetPasswordMail(user, resetToken).catch((error) => {
      console.error(
        `Failed to send password reset email for user ${user.id}:`,
        error
      );
    });
  }

  return {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
};

export const resetPasswordService = async (resetToken, password) => {
  const decoded = JwtHelper.verifyResetToken(resetToken);
  const userId = decoded.id;

  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User not found with the provided ID", 404);

  // to ignore token rotation and reuse
  const resetTokenRecord = await ResetToken.findOne({
    where: {
      token: resetToken,
    },
  });
  if (!resetTokenRecord) throw new AppError("Reset token is already used", 403);
  await resetTokenRecord.destroy();

  const hashedPassword = await bcrypt.hash(password, HASH_PASSWORD_ROUNDS);
  user.password = hashedPassword;
  await user.save();

  await RefreshToken.destroy({
    where: {
      user_id: user.id,
    },
  });

  return { message: "Password has been successfully reset." };
};
