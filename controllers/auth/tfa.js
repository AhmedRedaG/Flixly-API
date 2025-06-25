import crypto from "crypto";

import User from "../../models/user.js";
import { sendTFASms } from "../../utilities/smsSender.js";
import { generateBackupCodes } from "../../utilities/tfaHelper.js";

const TFA_DURATION = 1000 * 60 + 3; // 3 minutes

export const postEnableTFA = async (req, res, next) => {
  const { phoneNumber } = req.body;

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredIn = Date.now() + TFA_DURATION;
  const TFAExpiredInISO = new Date(TFAExpiredIn).toISOString();

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res.jsend.fail(
      {
        user: "No user found",
      },
      404
    );

  if (user.TFA.status === true)
    return res.jsend.fail({ phoneNumber: "2FA already enabled" }, 401);

  await sendTFASms(phoneNumber, TFACode);

  user.phoneNumber = phoneNumber;
  user.TFA.code = TFACode;
  user.TFA.expiredIn = TFAExpiredIn;
  user.TFA.backupCodes = generateBackupCodes();
  user.TFA.attempts = 0;
  await user.save();

  res.jsend.success({
    phoneNumber,
    expiredIn: TFAExpiredInISO,
    backupCodes: user.TFA.backupCodes.map((b) => b.code),
  });
};

export const postVerifySetupTFA = async (req, res, next) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res.jsend.fail(
      {
        user: "No user found",
      },
      404
    );

  if (user.TFA.status === true)
    return res.jsend.fail({ TFACode: "2FA already enabled" }, 401);
  if (user.TFA.code != TFACode)
    return res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);
  if (user.TFA.expiredIn < Date.now())
    return res.jsend.fail({ TFACode: "2FA token expired" }, 401);

  user.TFA.status = true;
  user.TFA.code = null;
  user.TFA.expiredIn = null;
  await user.save();

  res.jsend.success({ message: "2FA setup verified successfully" });
};

export const postRequestTFACode = async (req, res, next) => {
  const { email } = req.body;

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredIn = Date.now() + TFA_DURATION;
  const TFAExpiredInISO = new Date(TFAExpiredIn).toISOString();

  const user = await User.findOne({ email });
  if (!user)
    return res.jsend.fail(
      {
        user: "No user found",
      },
      404
    );

  if (user.TFA.status === false)
    return res.jsend.fail({ phoneNumber: "2FA not enabled" }, 401);

  const phoneNumber = user.phoneNumber;
  await sendTFASms(phoneNumber, TFACode);

  user.TFA.code = TFACode;
  user.TFA.expiredIn = TFAExpiredIn;
  await user.save();

  res.jsend.success({
    message: `2FA send verified successfully to **** ****${phoneNumber.slice(
      8
    )}`,
    expiredIn: TFAExpiredInISO,
  });
};
