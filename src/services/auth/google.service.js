import User from "../../models/user.js";
import AppError from "../../utilities/appError.js";
import * as JwtHelper from "../../utilities/jwtHelper.js";
import { generateTokensForUser } from "../../utilities/authHelper.js";

export const authWithGoogleService = async (user) => {
  const { accessToken, refreshToken, userSafeData } =
    await generateTokensForUser(user);
  await user.save();

  return {
    accessToken,
    refreshToken,
    userSafeData,
    message: "Google login successful",
  };
};
