import * as loginServer from "../../../services/auth/tfa/login.service.js";
import * as CookieHelper from "../../../utilities/CookieHelper.js";

export const loginVerifyTFA = async (req, res) => {
  const { TFACode, method, backupCode } = req.body;
  const userId = req.user._id;
  const { accessToken, refreshToken, userSafeData } =
    await loginServer.loginVerifyTFAService(
      userId,
      TFACode,
      method,
      backupCode
    );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success({ accessToken, user: userSafeData });
};
