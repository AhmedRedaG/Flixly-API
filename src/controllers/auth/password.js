import * as passwordServer from "../../services/auth/password.service.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, TFACode } = req.body;
  const userId = req.user._id;
  const data = await passwordServer.changePasswordService(
    userId,
    oldPassword,
    newPassword,
    TFACode
  );
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const data = await passwordServer.requestPasswordResetService(email);
  res.jsend.success(data);
};

export const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  if (!resetToken) throw new AppError("Reset token is missing");
  const data = await passwordServer.resetPasswordService(resetToken, password);
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};
