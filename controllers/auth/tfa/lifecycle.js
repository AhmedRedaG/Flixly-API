import * as tfaHelper from "../../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dbHelper.js";

export const enableTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  const isVerifiedCode = await verifyTFACode(user, TFACode, method, res);
  if (!isVerifiedCode) return;

  if (user.TFA.status === true && user.TFA.method === method)
    return res.jsend.fail({ method: `${method} 2FA already enabled` }, 401);

  if (user.TFA[method].status === false)
    return res.jsend.fail({ method: `${method} 2FA is not verified` }, 401);

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);
  tfaHelper.resetVerificationCycleData(user, method);

  user.TFA.status = true;
  user.TFA.method = method;
  await user.save();

  res.jsend.success({ backupCodes });
};

export const disableTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  const isVerifiedCode = await verifyTFACode(user, TFACode, method, res);
  if (!isVerifiedCode) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ status: `2FA already disabled` }, 401);

  if (user.TFA.method !== method)
    return res.jsend.fail({ method: `${method} 2FA is not in use` }, 401);

  tfaHelper.disableTFA(user);
  tfaHelper.resetVerificationCycleData(user, method);
  await user.save();

  res.jsend.success();
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

  const isVerifiedCode = await verifyTFACode(user, TFACode, method, res);
  if (!isVerifiedCode) return;

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);
  tfaHelper.resetVerificationCycleData(user, method);
  await user.save();

  res.jsend.success({
    message: "Backup codes regenerated",
    backupCodes,
  });
};
