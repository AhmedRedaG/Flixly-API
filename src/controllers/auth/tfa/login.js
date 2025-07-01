import * as loginServer from "../../../services/auth/tfa/login.service.js";

export const loginVerifyTFA = async (req, res) => {
  const { TFACode, method, backupCode } = req.body;
  const userId = req.user._id;
  const data = loginServer.loginVerifyTFAService(
    userId,
    TFACode,
    method,
    backupCode
  );
  res.jsend.success(data);
};
