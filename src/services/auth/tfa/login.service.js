import AppError from "../../../utilities/appError.js";
import * as tfaHelper from "../../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dataHelper.js";
import { generateTokensForUser } from "../../../utilities/authHelper.js";

export const loginVerifyTFAService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.status === false) throw new AppError("2FA is not enabled", 401);

  if (method !== "backup" && user.TFA.method !== method)
    throw new AppError(`${method} 2FA is not in use`, 401);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  const { accessToken, refreshToken, userSafeData } =
    await generateTokensForUser(user);
  await user.save();

  return { accessToken, refreshToken, userSafeData };
};
