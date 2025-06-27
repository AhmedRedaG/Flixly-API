import crypto from "crypto";
import bcrypt from "bcrypt";
import { totp, authenticator } from "otplib";

import * as JwtHelper from "../../utilities/JwtHelper.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";
import { sendTFASms } from "../../utilities/smsSender.js";
import { getUserByIdOrFail } from "../../utilities/dbHelper.js";
import * as tfaHelper from "../../utilities/tfaHelper.js";

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

  res.jsend.success();
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

export const verifySetupTFA = async (req, res) => {
  const { TFACode, method } = req.body;

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA[method].status === true)
    return res.jsend.fail({ TFACode: `${method} 2FA already enabled` }, 401);

  const isVerifiedCode = await verifyTFACode(user, TFACode, method, res);
  if (!isVerifiedCode) return;

  tfaHelper.resetVerificationCycleData(user, method);
  user.TFA[method].status = true;
  await user.save();

  res.jsend.success();
};

export const generateSmsTFACode = async (req, res, next) => {
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

export const removeSetupTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });
  if (!method || !["sms", "totp"].includes(method))
    return res.jsend.fail({ method: "Method missing or invalid" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA[method].status === false)
    return res.jsend.fail({ TFACode: `${method} 2FA already not setup` }, 401);

  const isVerifiedCode = await verifyTFACode(user, TFACode, method, res);
  if (!isVerifiedCode) return;

  if (user.TFA.status === true && user.TFA.method === method)
    tfaHelper.disableTFA();

  tfaHelper.resetVerificationCycleData(user, method);
  user.TFA[method].status === false;
  await user.save();

  res.jsend.success();
};

export const enableTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });
  if (!method || !["sms", "totp"].includes(method))
    return res.jsend.fail({ method: "Method missing or invalid" });

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
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });
  if (!method || !["sms", "totp"].includes(method))
    return res.jsend.fail({ method: "Method missing or invalid" });

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

export const requestBackupCodes = async (req, res) => {
  const { TFACode, method } = req.body;

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  if (user.TFA.method !== method)
    return res.jsend.fail({ method: `${method} 2FA is not in use` }, 401);

  const verifyTFACodeResult = await verifyTFACode(user, TFACode, method, res);
  if (!verifyTFACodeResult) return;

  const backupCodes = await tfaHelper.generateHashSaveBackupCodes(user);
  tfaHelper.resetVerificationCycleData(user, method);

  await user.save();

  res.jsend.success({
    message: "Backup codes regenerated",
    backupCodes,
  });
};

export const requestSmsTFACode = async (req, res, next) => {
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.sms.status === false)
    return res.jsend.fail({ phoneNumber: "2FA not enabled" }, 401);

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredIn = Date.now() + TFA_DURATION;
  const TFAExpiredInISO = new Date(TFAExpiredIn).toISOString();

  const phoneNumber = user.TFA.sms.number;
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
