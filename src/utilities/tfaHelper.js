import bcrypt from "bcrypt";
import { totp } from "speakeasy";

import AppError from "./appError.js";

const LOCK_DURATION = 1000 * 60 * 15; // 15 minutes

const verifyAttempts = async (user, method) => {
  const data = user.TFA[method];

  if (data.locked) {
    if (data.lockedUntil <= new Date(Date.now())) {
      data.locked = false;
      data.attempts = 0;
    } else {
      return false;
    }
  }

  if (data.attempts >= 5) {
    data.locked = true;
    data.lockedUntil = new Date(Date.now() + LOCK_DURATION);
    await user.save();
    return false;
  }

  return true;
};

const verifySmsCode = async (user, TFACode) => {
  if (!(await verifyAttempts(user, "sms"))) {
    throw new AppError("Too many attempts, try again later", 429);
  }

  if (user.TFA.sms.expiredAt < new Date(Date.now())) {
    throw new AppError("2FA token expired", 401);
  }

  if (user.TFA.sms.code != TFACode) {
    user.TFA.sms.attempts++;
    await user.save();
    throw new AppError("Invalid 2FA token", 401);
  }

  return true;
};

const verifyTotpCode = async (user, TFACode) => {
  if (!(await verifyAttempts(user, "sms"))) {
    throw new AppError("Too many attempts, try again later", 429);
  }

  const isValid = totp.verify({
    secret: user.TFA.totp.secret,
    encoding: "base32",
    token: TFACode,
    window: 1,
  });
  if (!isValid) {
    user.TFA.totp.attempts++;
    await user.save();
    throw new AppError("Invalid 2FA token", 401);
  }

  return true;
};

export const verifyTFACode = async (user, TFACode, method) => {
  if (method === "sms") return verifySmsCode(user, TFACode);
  if (method === "totp") return verifyTotpCode(user, TFACode);
};

const generateRawCodes = () => {
  // 8 backup codes, 8 digits each
  return Array.from({ length: 8 }, () =>
    Math.floor(10000000 + Math.random() * 90000000).toString()
  );
};

const hashRawCodes = (rawCodes) => {
  return rawCodes.map((code) => ({
    code: bcrypt.hashSync(code, 10),
    used: false,
  }));
};

export const generateHashSaveBackupCodes = async (user) => {
  const rawBackupCodes = generateRawCodes();
  const hashedBackupCodes = hashRawCodes(rawBackupCodes);
  user.TFA.backupCodes = hashedBackupCodes;

  return rawBackupCodes;
};

export const resetVerificationCycleData = (user, method) => {
  if (method === "sms") {
    user.TFA.sms.code = null;
    user.TFA.sms.expiredIn = null;
    user.TFA.sms.attempts = 0;
  }
  if (method === "totp") {
    user.TFA.totp.attempts = 0;
  }
};

export const disableTFA = (user) => {
  user.TFA.status = false;
  user.TFA.method = null;
  user.TFA.backupCodes = [];
};
