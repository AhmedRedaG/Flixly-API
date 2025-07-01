import * as passwordServer from "../../services/auth/password.service.js";

export const patchChangePassword = async (req, res) => {
  const { oldPassword, newPassword, TFACode } = req.body;
  const userId = req.user._id;
  const data = passwordServer.changePasswordService(
    userId,
    oldPassword,
    newPassword,
    TFACode
  );
  res.jsend.success(data);
};

export const postRequestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const data = passwordServer.requestPasswordResetService(email);
  res.jsend.success(data);
};

export const patchResetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const data = passwordServer.resetPasswordService(resetToken, password);
  res.jsend.success(data);
};
