import AppError from "../../../utilities/appError.js";
import * as tfaHelper from "../../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dataHelper.js";

export const enableTFAService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (method === "backup")
    throw new AppError(`This action cant be done using backup code`, 401);

  if (user.TFA[method].status === false)
    throw new AppError(`${method} 2FA is not verified`, 401);

  if (user.TFA.status === true && user.TFA.method === method)
    throw new AppError(`${method} 2FA already enabled`, 409);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);

  user.TFA.status = true;
  user.TFA.method = method;
  await user.save();

  return {
    backupCodes,
    message: `${method} 2FA has been enabled successfully`,
  };
};

export const disableTFAService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.status === false)
    throw new AppError(`2FA already disabled`, 409);

  if (method !== "backup" && user.TFA.method !== method)
    throw new AppError(`${method} 2FA is not in use`, 401);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  tfaHelper.disableTFA(user);
  await user.save();

  return { message: `${method} 2FA has been disabled successfully` };
};

export const getCurrentTFAStatusService = async (userId) => {
  const user = await getUserByIdOrFail(userId);
  const { status, method } = user.TFA;

  return {
    status,
    method,
    message: `Current 2FA status is ${status} and method is ${method}`,
  };
};

export const regenerateBackupCodesService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.status === false) throw new AppError("2FA is not enabled", 409);

  if (method !== "backup" && user.TFA.method !== method)
    throw new AppError(`${method} 2FA is not in use`, 401);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);
  await user.save();

  return { backupCodes, message: "Backup codes regenerated successfully" };
};
