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


export const requestResetPasswordMailService = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    const resetToken = JwtHelper.createResetToken({ id: user.id });

    console.log(resetToken);
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

  // to avoid user enumeration
  return {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
};

export const resetPasswordService = async (resetToken, password) => {
  const decoded = JwtHelper.verifyResetToken(resetToken);
  const userId = decoded.id;

  const user = await getUserByIdOrFail(userId);

  // to ignore token rotation and reuse
  const resetTokenRecord = await ResetToken.findOne({
    where: {
      token: resetToken,
    },
  });
  if (!resetTokenRecord) throw new AppError("Reset token is already used", 403);
  await resetTokenRecord.destroy();

  // hash new password and save
  const hashedPassword = await bcrypt.hash(password, HASH_PASSWORD_ROUNDS);
  user.password = hashedPassword;
  await user.save();

  // remove all refresh tokens
  await RefreshToken.destroy({
    where: {
      user_id: user.id,
    },
  });

  return { message: "Password has been successfully reset." };
};
