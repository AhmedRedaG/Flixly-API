import bcrypt from "bcrypt";
import * as JwtHelper from "../../../utilities/JwtHelper.js";
import * as CookieHelper from "../../../utilities/cookieHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dbHelper.js";
import * as tfaHelper from "../../../utilities/tfaHelper.js";
import AppError from "../../../utilities/AppError.js";

export const loginVerifyTFAService = async (
  userId,
  TFACode,
  method,
  backupCode
) => {
  if (!method || !["sms", "totp", "backup"].includes(method))
    throw new AppError("Method missing or invalid");

  const user = await getUserByIdOrFail(userId);

  if (user.TFA.status === false) throw new AppError("2FA is not enabled", 401);

  if (method === "backup") {
    if (!backupCode) throw new AppError("Backup code is required", 401);

    const backupCodeIndex = user.TFA.backupCodes.findIndex(
      (codeObj) => !codeObj.used && bcrypt.compareSync(backupCode, codeObj.code)
    );
    if (backupCodeIndex === -1)
      throw new AppError("Backup code is Invalid", 401);

    user.TFA.backupCodes[backupCodeIndex].used = true;
  } else {
    if (!TFACode) throw new AppError("2FA token is required", 401);

    if (user.TFA.method !== method)
      throw new AppError(`${method} 2FA is not in use`, 401);

    await tfaHelper.verifyTFACode(user, TFACode, method);

    tfaHelper.resetVerificationCycleData(user, method);
  }

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  return { accessToken, user: userSafeData };
};
