import * as tfaHelper from "../../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dbHelper.js";

import * as lifecycleServer from "../../../services/auth/tfa/lifecycle.service.js";
import AppError from "../../../utilities/AppError.js";

export const enableTFA = async (req, res) => {
  try {
    const { TFACode, method } = req.body;
    const userId = req.user._id;
    const data = lifecycleServer.enableTFAService(userId, TFACode, method);
    res.jsend.success({ data });
  } catch (err) {
    if (err instanceof AppError) {
      res.jsend.fail({ message: err.message }, err.statusCode || 400);
    } else {
      console.error(err);
      res.jsend.error({ message: "internal server error" }, 500);
    }
  }
};

export const disableTFA = async (req, res) => {
  try {
    const { TFACode, method } = req.body;
    const userId = req.user._id;
    const data = lifecycleServer.disableTFAService(userId, TFACode, method);
    res.jsend.success(data);
  } catch (err) {
    if (err instanceof AppError) {
      res.jsend.fail({ message: err.message }, err.statusCode || 400);
    } else {
      console.error(err);
      res.jsend.error({ message: "internal server error" }, 500);
    }
  }
};

export const getCurrentTFAStatus = async (req, res) => {
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  const { status, method } = user.TFA;
  res.jsend.success({ status, method });
};

export const regenerateBackupCodes = async (req, res) => {
  try {
    const { TFACode, method } = req.body;
    const userId = req.user._id;
    const data = lifecycleServer.regenerateBackupCodesService(
      userId,
      TFACode,
      method
    );
    res.jsend.success(data);
  } catch (err) {
    if (err instanceof AppError) {
      res.jsend.fail({ message: err.message }, err.statusCode || 400);
    } else {
      console.error(err);
      res.jsend.error({ message: "internal server error" }, 500);
    }
  }
};
