import * as loginServer from "../../../services/auth/tfa/login.service.js";
import * as CookieHelper from "../../../utilities/cookieHelper.js";

export const loginVerifyTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const { refreshToken, ...data } = await loginServer.loginVerifyTFAService(
    userId,
    TFACode,
    method
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success(data);
};
