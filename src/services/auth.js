import bcrypt from "bcrypt";
import { Op } from "sequelize";
import crypto from "crypto";

import { db } from "../../database/models/index.js";
import AppError from "../utilities/appError.js";
import * as JwtHelper from "../utilities/jwtHelper.js";
import { generateTokensForUser } from "../utilities/authHelper.js";
import { getSafeData, getUserByIdOrFail } from "../utilities/dataHelper.js";
import {
  sendVerifyTokenMail,
  sendResetPasswordMail,
} from "../utilities/mailHelper/mailSender.js";
import { constants } from "../../config/constants.js";

const { HASH_PASSWORD_ROUNDS } = constants.bcrypt;
const {
  OTP_MIN,
  OTP_MAX,
  BASE_BACKOFF_MINUTES,
  ALLOWED_OTP_TRIES,
  OTP_EXPIRES_AFTER_IN_MS,
} = constants.otp;
const { User, ResetToken, RefreshToken } = db;

export const postRegisterService = async (
  firstName,
  lastName,
  username,
  email,
  password,
  bio
) => {
  const userExisted = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }],
    },
  });
  if (userExisted) throw new AppError("Username or Email already in use", 409);

  const hashedPassword = await bcrypt.hash(password, HASH_PASSWORD_ROUNDS);

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    bio,
    password: hashedPassword,
  });
  const userSafeData = getSafeData(user);

  const verifyToken = JwtHelper.createVerifyToken({ id: user.id });
  console.log(verifyToken);

  // async mail request without await to avoid blocking I/O
  sendVerifyTokenMail(user, verifyToken).catch((error) => {
    console.error(
      `Failed to send verification email for user ${user.id}:`,
      error
    );
  });

  return {
    userSafeData,
    message:
      "Registration successful. A verification link is being sent to your email.",
  };
};

export const verifyMailService = async (verifyToken) => {
  // verify token validation and expiration
  const decoded = JwtHelper.verifyVerifyToken(verifyToken);
  const userId = decoded.id;

  const user = await getUserByIdOrFail(userId);

  if (user.verified) throw new AppError("User is already verified", 409);
  user.verified = true;
  await user.save();

  // generate safe data and access token for client and refresh token for cookie
  const { accessToken, refreshToken } = await generateTokensForUser(user);
  const userSafeData = getSafeData(user);

  return {
    accessToken,
    refreshToken,
    userSafeData,
    message: "Email verified successfully",
  };
};

export const postLoginService = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401);

  // (no password) => google account
  if (!user.password)
    throw new AppError("This account was registered with Google.", 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // not verified account
  if (!user.verified) {
    throw new AppError(
      "Account not verified. Please check your email for the verification link.",
      401
    );
  }

  const { accessToken, refreshToken } = await generateTokensForUser(user);
  const userSafeData = getSafeData(user);

  return {
    accessToken,
    refreshToken,
    userSafeData,
    message: "Login successful",
  };
};

export const postRefreshService = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw new AppError("No oldRefreshToken exist", 401);

  // verify token validation and expiration
  const decoded = JwtHelper.verifyRefreshToken(oldRefreshToken);
  const userId = decoded.id;

  // to ignore token rotation and reuse
  const refreshTokenRecord = await RefreshToken.findOne({
    where: {
      token: oldRefreshToken,
    },
  });
  if (!refreshTokenRecord) {
    throw new AppError("Invalid refresh token", 403);
  }
  await refreshTokenRecord.destroy();

  // no need for join
  const user = await getUserByIdOrFail(userId);

  const { accessToken, refreshToken } = await generateTokensForUser(user);

  return {
    accessToken,
    refreshToken,
    message: "Tokens refreshed successfully",
  };
};

export const postLogoutService = async (oldRefreshToken, logoutFullCase) => {
  if (!oldRefreshToken)
    return {
      message: "Already logged out",
    };

  const decoded = JwtHelper.verifyRefreshToken(oldRefreshToken);
  const userId = decoded.id;

  const user = await getUserByIdOrFail(userId);

  if (!logoutFullCase) {
    await RefreshToken.destroy({
      where: {
        token: oldRefreshToken,
      },
    });
  } else {
    await RefreshToken.destroy({
      where: {
        user_id: user.id,
      },
    });
  }

  return {
    message: "User logged out successfully",
  };
};

export const authWithGoogleService = async (user) => {
  const { accessToken, refreshToken } = await generateTokensForUser(user);
  const userSafeData = getSafeData(user);

  return {
    accessToken,
    refreshToken,
    userSafeData,
    message: "Google login successful",
  };
};

export const requestResetPasswordMailService = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (user) {
    const otp = crypto.randomInt(OTP_MIN, OTP_MAX);

    const [oldOtp] = await user.getResetOtps({
      order: [["created_at", "DESC"]],
      limit: 1,
    });

    if (oldOtp) {
      const addedMinutes =
        2 ** (Math.max(oldOtp.tries - ALLOWED_OTP_TRIES), BASE_BACKOFF_MINUTES);

      const allowAfter = new Date(oldOtp.created_at);
      allowAfter.setMinutes(allowAfter.getMinutes() + addedMinutes);

      if (oldOtp.tries > ALLOWED_OTP_TRIES && allowAfter > new Date())
        throw new AppError(
          `Too many requests. Try again after ${Math.ceil(
            (allowAfter - now) / 60000
          )} minutes.`,
          429
        );
    }

    await user.createResetOtp({
      otp,
      expires_at: new Date(Date.now() + OTP_EXPIRES_AFTER_IN_MS),
      tries: (oldOtp?.tries || 0) + 1,
    });

    // async mail request without await to avoid blocking I/O
    sendResetPasswordMail(user, otp).catch((error) => {
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
