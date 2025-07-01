import * as lifecycleServer from "../../../services/auth/tfa/lifecycle.service.js";

export const enableTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const data = lifecycleServer.enableTFAService(userId, TFACode, method);
  res.jsend.success(data);
};

export const disableTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const data = lifecycleServer.disableTFAService(userId, TFACode, method);
  res.jsend.success(data);
};

export const getCurrentTFAStatus = async (req, res) => {
  const userId = req.user._id;
  const data = lifecycleServer.getCurrentTFAStatusService(userId);
  res.jsend.success(data);
};

export const regenerateBackupCodes = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const data = lifecycleServer.regenerateBackupCodesService(
    userId,
    TFACode,
    method
  );
  res.jsend.success(data);
};
