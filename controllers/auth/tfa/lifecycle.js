import * as tfaHelper from "../../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dbHelper.js";

import * as lifecycleServer from "../../../services/auth/tfa/lifecycle.service.js";
import AppError from "../../../utilities/AppError.js";

export const enableTFA = async (req, res) => {
  try {
    const { TFACode, method } = req.body;
    const userId = req.user._id;
    const backupCodes = lifecycleServer.enableTFAService(
      userId,
      TFACode,
      method
    );
    res.jsend.success({ backupCodes });
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
  const { TFACode, method } = req.body;
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ status: `2FA already disabled` }, 401);

  if (user.TFA.method !== method)
    return res.jsend.fail({ method: `${method} 2FA is not in use` }, 401);

  const isVerifiedCode = await tfaHelper.verifyTFACode(
    user,
    TFACode,
    method,
    res
  );
  if (!isVerifiedCode) return;

  tfaHelper.disableTFA(user);
  tfaHelper.resetVerificationCycleData(user, method);
  await user.save();

  res.jsend.success({ method });
};

export const getCurrentTFAStatus = async (req, res) => {
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  const { status, method } = user.TFA;
  res.jsend.success({ status, method });
};

export const regenerateBackupCodes = async (req, res) => {
  const { TFACode, method } = req.body;
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  if (user.TFA.method !== method)
    return res.jsend.fail({ method: `${method} 2FA is not in use` }, 401);

  const isVerifiedCode = await tfaHelper.verifyTFACode(
    user,
    TFACode,
    method,
    res
  );
  if (!isVerifiedCode) return;

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);
  tfaHelper.resetVerificationCycleData(user, method);
  await user.save();

  res.jsend.success({
    message: "Backup codes regenerated",
    backupCodes,
  });
};
