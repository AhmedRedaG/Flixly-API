import bcrypt from "bcrypt";
import { Op } from "sequelize";

import { db } from "../../../database/models/index.js";
import AppError from "../../utilities/appError.js";
import * as JwtHelper from "../../utilities/jwtHelper.js";
import { generateTokensForUser } from "../../utilities/authHelper.js";
import { getSafeData } from "../../utilities/dataHelper.js";
import { sendVerifyTokenMail } from "../../utilities/mailHelper/mailSender.js";
import * as configs from "../../../config/index.js";

const { HASH_PASSWORD_ROUNDS } = configs.constants.bcrypt;
const { REFRESH_TOKEN_AGE_IN_MS } = configs.constants.jwt;
const { User, RefreshToken } = db;

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
  const user = (
    await User.create({
      firstName,
      lastName,
      username,
      email,
      bio,
      password: hashedPassword,
    })
  ).toJSON();
  const userSafeData = getSafeData(user);

  const verifyToken = JwtHelper.createVerifyToken({ id: user.id });
  console.log(verifyToken);
  const sendMailResult = await sendVerifyTokenMail(user, verifyToken);

  return { userSafeData, message: `Verification ${sendMailResult}` };
};

export const verifyMailService = async (verifyToken) => {
  const decoded = JwtHelper.verifyVerifyToken(verifyToken);
  const userId = decoded.id;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("User not found with the provided ID", 404);
  }

  if (user.verified) throw new AppError("User is already verified", 409);
  user.verified = true;
  await user.save();

  // generate safe data and access token for client and refresh token for cookie
  const { accessToken, refreshToken, userSafeData } =
    await generateTokensForUser(user);

  return {
    accessToken,
    refreshToken,
    userSafeData,
    message: "Email verified successfully",
  };
};

export const postLoginService = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  // (no password) => google account
  const isPasswordValid = user?.password
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !user.password || !isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // not verified account
  if (!user.verified) {
    throw new AppError(
      "Account not verified. Please check your email for the verification link.",
      401
    );
  }

  const { accessToken, refreshToken, userSafeData } =
    await generateTokensForUser(user);

  return {
    accessToken,
    refreshToken,
    userSafeData,
    message: "Login successful",
  };
};

export const postRefreshService = async (oldRefreshToken) => {
  if (!oldRefreshToken) throw new AppError("No oldRefreshToken exist", 401);

  const decoded = JwtHelper.verifyRefreshToken(oldRefreshToken);
  const userId = decoded.id;

  const refreshTokenRecord = await RefreshToken.findOne({
    where: {
      token: oldRefreshToken,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
    include: {
      model: User,
      as: "user",
    },
  });
  if (!refreshTokenRecord) {
    throw new AppError("Invalid or expired refresh token", 403);
  }

  const user = refreshTokenRecord.user;
  const { accessToken, refreshToken } = await generateTokensForUser(user);

  // to ignore token rotation and reuse
  await refreshTokenRecord.update({
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_AGE_IN_MS),
  });

  return {
    accessToken,
    refreshToken,
    message: "Tokens refreshed successfully",
  };
};

export const postLogoutService = async (refreshToken, logoutFullCase) => {
  if (!refreshToken)
    return {
      message: "Already logged out",
    };

  const decoded = JwtHelper.verifyRefreshToken(refreshToken);
  const userId = decoded._id;

  const user = await getUserByIdOrFail(userId);

  if (!logoutFullCase)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  else user.refreshTokens = [];
  await user.save();

  return {
    message: "User logged out successfully",
  };
};
