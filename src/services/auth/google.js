import { generateTokensForUser } from "../../utilities/authHelper.js";
import { getSafeData } from "../../utilities/dataHelper.js";

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
