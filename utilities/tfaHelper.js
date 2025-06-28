import bcrypt from "bcrypt";
import { totp } from "otplib";

const verifySmsCode = async (user, TFACode, res) => {
  if (user.TFA.sms.attempts > 5) {
    res.jsend.fail({ TFACode: "Too many attempts" }, 429);
    return false;
  }
  if (user.TFA.sms.expiredIn < Date.now()) {
    res.jsend.fail({ TFACode: "2FA token expired" }, 401);
    return false;
  }
  if (user.TFA.sms.code != TFACode) {
    user.TFA.sms.attempts++;
    await user.save();
    res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);
    return false;
  }
  return true;
};

const verifyTotpCode = async (user, TFACode, res) => {
  if (user.TFA.totp.attempts > 5) {
    res.jsend.fail({ TFACode: "Too many attempts" }, 429);
    return false;
  }
  if (!totp.check(TFACode, userTotp.secret)) {
    res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);
    return false;
  }
  return true;
};

export const verifyTFACode = async (user, TFACode, method, res) => {
  if (method === "sms") return verifySmsCode(user, TFACode, res);
  if (method === "totp") return verifySmsCode(user, TFACode, res);
};

const generateRawCodes = () => {
  // 8 backup codes, 8 digits each
  return Array.from({ length: 8 }, () =>
    Math.floor(10000000 + Math.random() * 90000000).toString()
  );
};

const hashRwwCodes = (rawCodes) => {
  return rawCodes.map((code) => ({
    code: bcrypt.hashSync(code, 10),
    used: false,
  }));
};

export const generateHashSaveBackupCodes = async (user) => {
  const rawBackupCodes = generateRawCodes();
  const hashedBackupCodes = hashRwwCodes(rawBackupCodes);
  user.TFA.backupCodes = hashedBackupCodes;

  return rawBackupCodes.map((codeObj) => codeObj.code);
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
