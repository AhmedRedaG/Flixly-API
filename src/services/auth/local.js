import bcrypt from "bcrypt";
import { Op } from "sequelize";

import { db } from "../../../database/models/index.js";
import AppError from "../../utilities/appError.js";
import * as JwtHelper from "../../utilities/jwtHelper.js";
import { generateTokensForUser } from "../../utilities/authHelper.js";
import { getUserByIdOrFail, getSafeData } from "../../utilities/dataHelper.js";
import { sendVerifyTokenMail } from "../../utilities/mailHelper/mailSender.js";
import * as configs from "../../../config/index.js";

const { HASH_PASSWORD_ROUNDS } = configs.constants.bcrypt;
const { User } = db;

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

  const user = await getUserByIdOrFail(userId);

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
  if (!user) throw new AppError("Invalid email or password", 401);

  // google account
  if (!user.password)
    throw new AppError("This account was registered with Google.", 401);

  const matchedPasswords = await bcrypt.compare(password, user.password);
  if (!matchedPasswords) throw new AppError("Invalid email or password", 401);

  // not verified account
  if (!user.verified) {
    const verifyToken = JwtHelper.createVerifyToken({ id: user.id });
    const sendMailResult = await sendVerifyTokenMail(user, verifyToken);
    throw new AppError(
      "Account not verified, please check your email for verification link.",
      401
    );
  }

  const { accessToken, refreshToken, userSafeData } =
    await generateTokensForUser(user);
  await user.save();

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

  const user = await getUserByIdOrFail(userId);

  const refreshTokenIndex = user.findIndex((rf) => rf === oldRefreshToken);
  if (refreshTokenIndex === -1)
    throw new AppError("Invalid refresh token", 403);

  const { accessToken, refreshToken } = await generateTokensForUser(user);

  user.refreshTokens[refreshTokenIndex] = refreshToken;
  user.refreshTokens = user.refreshTokens.slice(-5);
  await user.save();

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
