import crypto from "crypto";
import bcrypt from "bcrypt";
import { totp, authenticator } from "otplib";

import * as JwtHelper from "../../utilities/JwtHelper.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";
import { sendTFASms } from "../../utilities/smsSender.js";
import { getUserByIdOrFail } from "../../utilities/dbHelper.js";
import { updateUserTFAData, verifyTFACode } from "../../utilities/tfaHelper.js";

const TFA_DURATION = 1000 * 60 * 5; // 5 minutes

export const setupTFASms = async (req, res, next) => {
  const { phoneNumber } = req.body;

  const user = await getUserByIdOrFail(req.user._id);
  if (!user) return;

  // cant reset number with 2fa enabled, you can disable it first or update the number using the 2fa code
  if (user.TFA.sms.status === true)
    return res.jsend.fail({
      phoneNumber: "Phone number already set and 2fa is activated",
    });

  user.TFA.sms.number = phoneNumber;
  await user.save();

  res.jsend.success({ phoneNumber });
};

export const setupTFATotp = async (req, res, next) => {
  const user = await getUserByIdOrFail(req.user._id);
  if (!user) return;

  // cant reset secret with 2fa enabled
  if (user.TFA.totp.status === true)
    return res.jsend.fail({
      totp: "totp already set and 2fa is activated",
    });

  const secret = authenticator.generateSecret(32);
  user.TFA.totp.secret = secret;
  await user.save();

  res.jsend.success({ secret });
};

// create 2fa code
export const generateTFACode = async (req, res, next) => {
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredIn = Date.now() + TFA_DURATION;
  const TFAExpiredInISO = new Date(TFAExpiredIn).toISOString();

  const phoneNumber = user.TFA.sms.number;
  if (!phoneNumber)
    return res.jsend.fail({ phoneNumber: "No phone number founded" });

  // await sendTFASms(phoneNumber, TFACode);
  console.log(">>>>>>>>>>>> " + TFACode);

  user.TFA.sms.code = TFACode;
  user.TFA.sms.expiredIn = TFAExpiredIn;
  user.TFA.sms.attempts = 0;
  await user.save();

  res.jsend.success({
    message: `2FA send verified successfully to *******${phoneNumber.slice(9)}`,
    expiredIn: TFAExpiredInISO,
  });
};

export const verifySetupTFASms = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.sms.status === true)
    return res.jsend.fail({ TFACode: "2FA already enabled" }, 401);

  const isVerifiedCode = await verifyTFACode(user, TFACode, res);
  if (!isVerifiedCode) return;

  // update TFA details (shown in the model schema) and return the backup codes: (user, disableTFA = false, res)
  const rawBackupCodes = await updateUserTFAData(user, false, res);
  await user.save();

  res.jsend.success({
    message: "2FA enabled successfully",
    backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const verifySetupTFATotp = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.totp.status === true)
    return res.jsend.fail({ TFACode: "2FA already enabled" }, 401);

  const secret = user.TFA.totp.secret;
  const isVerifiedCode = totp.check(TFACode, secret);
  if (!isVerifiedCode)
    return res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);

  user.TFA.totp.status = true;
  await user.save();

  res.jsend.success({
    message: "2FA enabled successfully",
    // backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const updateTFASms = async (req, res) => {
  const { TFACode, phoneNumber } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.sms.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const isVerifiedCode = await verifyTFACode(user, TFACode, res);
  if (!isVerifiedCode) return;

  const rawBackupCodes = await updateUserTFAData(user, false, res);
  user.TFA.sms.number = phoneNumber;
  await user.save();

  res.jsend.success({
    message: "2FA updated successfully",
    backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const updateTFATotp = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.totp.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const secret = user.TFA.totp.secret;
  const isVerifiedCode = totp.check(TFACode, secret);
  if (!isVerifiedCode)
    return res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);

  secret = authenticator.generateSecret(32);
  user.TFA.totp.secret = secret;
  await user.save();

  res.jsend.success({
    message: "2FA enabled successfully",
    secret,
    // backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const disableTFASms = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.sms.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const isVerifiedCode = await verifyTFACode(user, TFACode, res);
  if (!isVerifiedCode) return;

  // disableTFA = true
  await updateUserTFAData(user, true, res);
  await user.save();

  res.jsend.success({
    message: "2FA disabled successfully",
  });
};

export const disableTFATotp = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.totp.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const secret = user.TFA.totp.secret;
  const isVerifiedCode = totp.check(TFACode, secret);
  if (!isVerifiedCode)
    return res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);

  // disableTFA = true
  user.TFA.totp.status = false;
  user.TFA.totp.secret = null;
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
