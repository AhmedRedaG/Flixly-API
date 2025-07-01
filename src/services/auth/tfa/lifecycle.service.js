import * as tfaHelper from "../../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dataHelper.js";
import AppError from "../../../utilities/AppError.js";

export const enableTFAService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA[method].status === false)
    throw new AppError(`${method} 2FA is not verified`, 401);

  if (user.TFA.status === true && user.TFA.method === method)
    throw new AppError(`${method} 2FA already enabled`, 401);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);
  tfaHelper.resetVerificationCycleData(user, method);

  user.TFA.status = true;
  user.TFA.method = method;
  await user.save();

  return { backupCodes };
};

export const disableTFAService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.status === false)
    throw new AppError(`2FA already disabled`, 401);

  if (user.TFA.method !== method)
    throw new AppError(`${method} 2FA is not in use`, 401);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  tfaHelper.disableTFA(user);
  tfaHelper.resetVerificationCycleData(user, method);
  await user.save();

  return { method };
};

export const getCurrentTFAStatusService = async (userId) => {
  const user = await getUserByIdOrFail(userId);
  const { status, method } = user.TFA;

  return { status, method };
};

export const regenerateBackupCodesService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.status === false) throw new AppError("2FA is not enabled", 401);

  if (user.TFA.method !== method)
    throw new AppError(`${method} 2FA is not in use`, 401);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);
  tfaHelper.resetVerificationCycleData(user, method);
  await user.save();

  return { backupCodes };
};
