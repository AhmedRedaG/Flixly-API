import * as passwordServer from "../../services/auth/password.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;
  const data = await passwordServer.changePasswordService(
    user,
    oldPassword,
    newPassword
  );
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};

export const requestResetPasswordMail = async (req, res) => {
  const { email } = req.body;
  const data = await passwordServer.requestResetPasswordMailService(email);
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
