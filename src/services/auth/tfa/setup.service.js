import speakeasy from "speakeasy";
import qrcode from "qrcode";

import AppError from "../../../utilities/appError.js";
import * as tfaHelper from "../../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../../utilities/dataHelper.js";

export const setupTFASmsService = async (userId, phoneNumber) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.sms.status === true)
    throw new AppError("Phone number already set and 2fa is activated", 409);

  user.TFA.sms.number = phoneNumber;
  await user.save();

  return {
    phoneNumber,
    message: "Phone number has been set successfully for 2FA setup",
  };
};

export const setupTFATotpService = async (userId) => {
  const user = await getUserByIdOrFail(userId);

  if (user.TFA.totp.status === true)
    throw new AppError("totp already set and 2fa is activated", 409);

  const secretOdj = speakeasy.generateSecret({
    length: 32,
    name: "myAuth:ahmedrf.dev@gmail.com",
    issuer: "myAuth",
  });
  const qrCodeDataURL = await qrcode.toDataURL(secretOdj.otpauth_url);

  user.TFA.totp.secret = secretOdj.base32;
  await user.save();

  return {
    secret: secretOdj.base32,
    qrCodeDataURL,
    message: "TOTP secret generated successfully",
  };
};

export const verifySetupTFAService = async (
  userId,
  TFACode,
  method,
  enable
) => {
  const user = await getUserByIdOrFail(userId);

  if (method === "backup")
    throw new AppError(`This action cant be done using backup code`, 401);

  if (user.TFA[method].status === true)
    throw new AppError(`${method} 2FA already verified`, 409);

  if (method === "sms" && !user.TFA.sms.number)
    throw new AppError("No phone number found for SMS verification");

  if (method === "totp" && !user.TFA.totp.secret)
    throw new AppError("No secret found for TOTP verification");

  await tfaHelper.verifyTFACode(user, TFACode, method);

  if (enable) {
    user.TFA.status = true;
    user.TFA.method = method;
  }

  user.TFA[method].status = true;
  await user.save();

  return { method, message: `${method} 2FA has been verified successfully` };
};

export const revokeSetupTFAService = async (userId, TFACode, method) => {
  const user = await getUserByIdOrFail(userId);

  if (method === "backup")
    throw new AppError(`This action cant be done using backup code`, 401);

  if (user.TFA[method].status === false)
    throw new AppError(`${method} 2FA is not setup`, 409);

  await tfaHelper.verifyTFACode(user, TFACode, method);

  if (user.TFA.status === true && user.TFA.method === method)
    tfaHelper.disableTFA(user);

  user.TFA[method].status = false;
  await user.save();

  return { method, message: `${method} 2FA has been revoked successfully` };
};
