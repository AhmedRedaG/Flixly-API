import * as lifecycleServer from "../../../services/auth/tfa/lifecycle.service.js";

export const enableTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const data = await lifecycleServer.enableTFAService(userId, TFACode, method);
  res.jsend.success(data);
};

export const disableTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const data = await lifecycleServer.disableTFAService(userId, TFACode, method);
  res.jsend.success(data);
};

export const getCurrentTFAStatus = async (req, res) => {
  const userId = req.user._id;
  const data = await lifecycleServer.getCurrentTFAStatusService(userId);
  res.jsend.success(data);
};

export const regenerateBackupCodes = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const data = await lifecycleServer.regenerateBackupCodesService(
    userId,
    TFACode,
    method
  );
  res.jsend.success(data);
};
