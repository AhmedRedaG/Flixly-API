import bcrypt from "bcrypt";

export const verifyTFACode = async (user, TFACode, res) => {
  if (user.TFA.code !== TFACode) {
    user.TFA.attempts++;
    await user.save();
    res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);
    return false;
  }
  if (user.TFA.expiredIn < Date.now()) {
    res.jsend.fail({ TFACode: "2FA token expired" }, 401);
    return false;
  }
  if (user.TFA.attempts > 5) {
    res.jsend.fail({ TFACode: "Too many attempts" }, 429);
    return false;
  }
  return true;
};

const generateBackupCodes = () => {
  // 8 backup codes, 8 digits each
  return Array.from({ length: 8 }, () => ({
    code: Math.floor(10000000 + Math.random() * 90000000).toString(),
    used: false,
  }));
};

export const updateUserTFAData = async (user, disableTFA = false, res) => {
  let rawBackupCodes = [];
  if (disable) {
    user.TFA.status = false;
    user.TFA.backupCodes = [];
  } else {
    rawBackupCodes = generateBackupCodes();
    const hashedBackupCodes = rawBackupCodes.map((code) => ({
      code: bcrypt.hashSync(code.code, 12),
      used: false,
    }));
    user.TFA.status = true;
    user.TFA.backupCodes = hashedBackupCodes;
  }

  user.TFA.code = null;
  user.TFA.expiredIn = null;
  user.TFA.attempts = 0;

  return { user, rawBackupCodes };
};
