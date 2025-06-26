import crypto from "crypto";
import bcrypt from "bcrypt";
import { totp } from "otplib";

import * as JwtHelper from "../../utilities/JwtHelper.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";
import { sendTFASms } from "../../utilities/smsSender.js";
import { getUserByIdOrFail } from "../../utilities/dbHelper.js";
import { updateUserTFAData, verifyTFACode } from "../../utilities/tfaHelper.js";

const TFA_DURATION = 1000 * 60 * 5; // 5 minutes

// create 2fa code
export const setupTFA = async (req, res, next) => {
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredIn = Date.now() + TFA_DURATION;
  const TFAExpiredInISO = new Date(TFAExpiredIn).toISOString();

  const phoneNumber = user.TFA.number;
  if (!phoneNumber)
    return res.jsend.fail({ phoneNumber: "No phone number founded" });

  // await sendTFASms(phoneNumber, TFACode);
  console.log(">>>>>>>>>>>> " + TFACode);

  user.TFA.code = TFACode;
  user.TFA.expiredIn = TFAExpiredIn;
  user.TFA.attempts = 0;
  await user.save();

  res.jsend.success({
    message: `2FA send verified successfully to *******${phoneNumber.slice(9)}`,
    expiredIn: TFAExpiredInISO,
  });
};

export const enableTFA = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === true)
    return res.jsend.fail({ TFACode: "2FA already enabled" }, 401);

  const verifyTFACodeResult = await verifyTFACode(user, TFACode, res);
  if (!verifyTFACodeResult) return;

  // update TFA details (shown in the model schema) and return the backup codes: (user, disableTFA = false, res)
  const rawBackupCodes = await updateUserTFAData(user, false, res);
  await user.save();

  res.jsend.success({
    message: "2FA enabled successfully",
    backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const updateTFA = async (req, res) => {
  const { TFACode, phoneNumber } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const verifyTFACodeResult = await verifyTFACode(user, TFACode, res);
  if (!verifyTFACodeResult) return;

  const rawBackupCodes = await updateUserTFAData(user, false, res);
  user.TFA.number = phoneNumber;
  await user.save();

  res.jsend.success({
    message: "2FA updated successfully",
    backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const disableTFA = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const verifyTFACodeResult = await verifyTFACode(user, TFACode, res);
  if (!verifyTFACodeResult) return;

  // disableTFA = true
  await updateUserTFAData(user, true, res);
  await user.save();

  res.jsend.success({
    message: "2FA disabled successfully",
  });
};

export const requestNewBackupCodes = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const verifyTFACodeResult = await verifyTFACode(user, TFACode, res);
  if (!verifyTFACodeResult) return;

  const rawBackupCodes = await updateUserTFAData(user, false, res);
  await user.save();

  res.jsend.success({
    message: "Backup codes regenerated",
    backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const requestTFACode = async (req, res, next) => {
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ phoneNumber: "2FA not enabled" }, 401);

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredIn = Date.now() + TFA_DURATION;
  const TFAExpiredInISO = new Date(TFAExpiredIn).toISOString();

  const phoneNumber = user.TFA.number;
  // await sendTFASms(phoneNumber, TFACode);
  console.log(">>>>>>>>>>>> " + TFACode);

  user.TFA.code = TFACode;
  user.TFA.expiredIn = TFAExpiredIn;
  user.TFA.attempts = 0;
  await user.save();

  res.jsend.success({
    message: `2FA send verified successfully to *******${phoneNumber.slice(9)}`,
    expiredIn: TFAExpiredInISO,
  });
};

export const verifyLoginWithTFA = async (req, res, next) => {
  const { TFACode, backupCode } = req.body;

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (!TFACode) {
    if (!backupCode)
      return res.jsend.fail({ TFACode: "2FA token is required" }, 401);

    const backupCodeIndex = user.TFA.backupCodes.findIndex(
      (BC) => !BC.used && bcrypt.compareSync(backupCode, BC.code)
    );
    if (backupCodeIndex === -1)
      return res.jsend.fail({ backupCode: "Backup code is Invalid" }, 401);

    user.TFA.backupCodes[backupCodeIndex].used = true;
  } else {
    const verifyTFACodeResult = await verifyTFACode(user, TFACode, res);
    if (!verifyTFACodeResult) return;
  }

  user.TFA.code = null;
  user.TFA.expiredIn = null;
  user.TFA.attempts = 0;

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  res.jsend.success({ accessToken, user: userSafeData });
};
