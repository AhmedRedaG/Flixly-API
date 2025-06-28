import { authenticator } from "otplib";
import { getUserByIdOrFail } from "../../../utilities/dbHelper.js";
import * as tfaHelper from "../../../utilities/tfaHelper.js";

export const setupTFASms = async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await getUserByIdOrFail(req.user._id);
  if (!user) return;

  if (user.TFA.sms.status === true)
    return res.jsend.fail({
      phoneNumber: "Phone number already set and 2fa is activated",
    });

  user.TFA.sms.number = phoneNumber;
  await user.save();
  res.jsend.success();
};

export const setupTFATotp = async (req, res) => {
  const user = await getUserByIdOrFail(req.user._id);
  if (!user) return;

  if (user.TFA.totp.status === true)
    return res.jsend.fail({ totp: "totp already set and 2fa is activated" });

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

  const isVerifiedCode = await tfaHelper.verifyTFACode(
    user,
    TFACode,
    method,
    res
  );
  if (!isVerifiedCode) return;

  tfaHelper.resetVerificationCycleData(user, method);
  user.TFA[method].status = true;
  await user.save();
  res.jsend.success();
};

export const revokeSetupTFA = async (req, res) => {
  const { TFACode, method } = req.body;
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA[method].status === false)
    return res.jsend.fail({ TFACode: `${method} 2FA already not setup` }, 401);

  const isVerifiedCode = await tfaHelper.verifyTFACode(
    user,
    TFACode,
    method,
    res
  );
  if (!isVerifiedCode) return;

  if (user.TFA.status === true && user.TFA.method === method)
    tfaHelper.disableTFA();

  tfaHelper.resetVerificationCycleData(user, method);
  user.TFA[method].status = false;
  await user.save();
  res.jsend.success();
};
