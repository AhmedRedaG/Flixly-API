import * as setupServer from "../../../services/auth/tfa/setup.service.js";

export const setupTFASms = async (req, res) => {
  const { phoneNumber } = req.body;
  const userId = req.user._id;
  const data = await setupServer.setupTFASmsService(userId, phoneNumber);
  res.jsend.success(data);
};

export const setupTFATotp = async (req, res) => {
  const userId = req.user._id;
  const data = await setupServer.setupTFATotpService(userId);
  res.jsend.success(data);
};

export const verifySetupTFA = async (req, res) => {
  const { TFACode, method, enable } = req.body;
  const userId = req.user._id;
  const data = await setupServer.verifySetupTFAService(
    userId,
    TFACode,
    method,
    enable
  );
  res.jsend.success(data);
};

export const revokeSetupTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const userId = req.user._id;
  const data = await setupServer.revokeSetupTFAService(userId, TFACode, method);
  res.jsend.success(data);
};
