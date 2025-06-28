import bcrypt from "bcrypt";
import * as JwtHelper from "../../../utilities/JwtHelper.js";
import * as CookieHelper from "../../../utilities/cookieHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dbHelper.js";
import * as tfaHelper from "../../../utilities/tfaHelper.js";

export const loginVerifyTFA = async (req, res) => {
  const { TFACode, method, backupCode } = req.body;

  if (!method || !["sms", "totp", "backup"].includes(method))
    return res.jsend.fail({ method: "Method missing or invalid" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  if (method === "backup") {
    if (!backupCode)
      return res.jsend.fail({ backupCode: "Backup code is required" }, 401);

    const backupCodeIndex = user.TFA.backupCodes.findIndex(
      (codeObj) => !codeObj.used && bcrypt.compareSync(backupCode, codeObj.code)
    );
    if (backupCodeIndex === -1)
      return res.jsend.fail({ backupCode: "Backup code is Invalid" }, 401);

    user.TFA.backupCodes[backupCodeIndex].used = true;
  } else {
    if (!TFACode)
      return res.jsend.fail({ TFACode: "2FA token is required" }, 401);

    if (user.TFA.method !== method)
      return res.jsend.fail({ method: `${method} 2FA is not in use` }, 401);

    const isVerifiedCode = await tfaHelper.verifyTFACode(
      user,
      TFACode,
      method,
      res
    );
    if (!isVerifiedCode) return;

    tfaHelper.resetVerificationCycleData(user, method);
  }

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  res.jsend.success({ accessToken, user: userSafeData });
};
