import bcrypt from "bcrypt";
import { totp } from "speakeasy";
import { randomInt } from "crypto";

import AppError from "./appError.js";
import * as configs from "./../config/index.js";

const { HASH_BACKUP_CODES_ROUNDS } = configs.constants.bcrypt,
  { LOCK_DURATION, MAX_ATTEMPTS, BACKUP_CODE_COUNT } = configs.constants.tfa;

export const verifyAttempts = async (user, method) => {
  const data = user.TFA[method];

  if (data.locked) {
    if (data.lockedUntil <= new Date()) {
      data.locked = false;
      data.attempts = 0;
      await user.save();
    } else {
      throw new AppError(
        "Account temporarily locked due to too many failed attempts",
        429
      );
    }
  }

  if (data.attempts >= MAX_ATTEMPTS) {
    data.locked = true;
    data.lockedUntil = new Date(Date.now() + LOCK_DURATION);
    await user.save();
    throw new AppError(
      "Too many failed attempts. Account locked temporarily",
      429
    );
  }

  return true;
};

const incrementAttempts = async (user, method) => {
  user.TFA[method].attempts++;
  await user.save();
};

const resetVerificationCycleData = (user, method) => {
  switch (method) {
    case "sms":
      user.TFA.sms.code = null;
      user.TFA.sms.expiredAt = null;
      user.TFA.sms.attempts = 0;
      user.TFA.sms.locked = false;
      break;
    case "totp":
      user.TFA.totp.attempts = 0;
      user.TFA.totp.locked = false;
      break;
    default:
      throw new AppError("Invalid 2FA method");
  }
};

export const verifySmsCode = async (user, TFACode) => {
  await verifyAttempts(user, "sms");

  if (!user.TFA.sms.code) {
    throw new AppError("No active SMS code found");
  }

  if (user.TFA.sms.expiredAt < new Date()) {
    throw new AppError("2FA token expired", 401);
  }

  if (user.TFA.sms.code !== Number(TFACode)) {
    await incrementAttempts(user, "sms");
    throw new AppError("Invalid 2FA token", 401);
  }

  resetVerificationCycleData(user, "sms");
  return true;
};

export const verifyTotpCode = async (user, TFACode) => {
  await verifyAttempts(user, "totp");

  const isValid = totp.verify({
    secret: user.TFA.totp.secret,
    encoding: "base32",
    token: TFACode,
    window: 1,
  });
  if (!isValid) {
    await incrementAttempts(user, "totp");
    throw new AppError("Invalid 2FA token", 401);
  }

  resetVerificationCycleData(user, "totp");
  return true;
};

export const verifyBackupCode = async (user, backupCode) => {
  const unusedCodes = user.TFA.backupCodes.filter((code) => !code.used);
  if (unusedCodes.length === 0) {
    throw new AppError("All backup codes have been used", 400);
  }

  const comparisons = user.TFA.backupCodes.map(async (codeObj, index) => {
    if (codeObj.used) {
      return { index, isValid: false };
    }
    const isValid = await bcrypt.compare(backupCode, codeObj.code);
    return { index, isValid };
  });
  const results = await Promise.all(comparisons);

  const validResult = results.find((result) => result.isValid);
  if (validResult) {
    user.TFA.backupCodes[validResult.index].used = true;
    return true;
  }

  throw new AppError("Backup code is Invalid", 401);
};

export const verifyTFACode = async (user, TFACode, method) => {
  switch (method) {
    case "sms":
      return await verifySmsCode(user, TFACode);
    case "totp":
      return await verifyTotpCode(user, TFACode);
    case "backup":
      return await verifyBackupCode(user, TFACode);
    default:
      throw new AppError("Invalid 2FA method");
  }
};

const generateRawCodes = () => {
  return Array.from({ length: BACKUP_CODE_COUNT }, () =>
    randomInt(10000000, 99999999)
  );
};

const hashRawCodes = async (rawCodes) => {
  const hashedCodes = await Promise.all(
    rawCodes.map(async (code) => ({
      code: await bcrypt.hash(code, HASH_BACKUP_CODES_ROUNDS),
      used: false,
    }))
  );
  return hashedCodes;
};

export const generateHashSaveBackupCodes = async (user) => {
  const rawBackupCodes = generateRawCodes();
  const hashedBackupCodes = await hashRawCodes(rawBackupCodes);
  user.TFA.backupCodes = hashedBackupCodes;

  return rawBackupCodes;
};

export const disableTFA = (user) => {
  user.TFA.status = false;
  user.TFA.method = null;
  user.TFA.backupCodes = [];

  if (user.TFA.sms) {
    user.TFA.sms.attempts = 0;
    user.TFA.sms.locked = false;
  }
  if (user.TFA.totp) {
    user.TFA.totp.attempts = 0;
    user.TFA.totp.locked = false;
  }
};
