import User from "../../models/user.js";
import AppError from "../../utilities/appError.js";
import * as JwtHelper from "../../utilities/jwtHelper.js";
import { generateTokensForUser } from "../../utilities/authHelper.js";

export const authWithGoogleService = async (googleId) => {
  const user = await User.findOne({ googleId });
  if (!user) throw new AppError("Invalid googleId", 401);

  if (user.TFA.status === true) {
    const tempToken = JwtHelper.createTempToken({ _id: user._id });
    return { method: user.TFA.method, tempToken };
  }

  const { accessToken, refreshToken, userSafeData } =
    await generateTokensForUser(user);
  await user.save();

  return { accessToken, refreshToken, userSafeData };
};
