import crypto from "crypto";
import bcrypt from "bcrypt";

import User from "../../models/user.js";
import { sendTFASms } from "../../utilities/smsSender.js";
import { generateBackupCodes } from "../../utilities/tfaHelper.js";

const TFA_DURATION = 1000 * 60 + 3; // 3 minutes

// create and update 2fa
export const postSetupTFA = async (req, res, next) => {
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
  user.TFA.attempts = 0;
  await user.save();

  res.jsend.success({
    phoneNumber,
    expiredIn: TFAExpiredInISO,
  });
};

// verify any setup operations: create new 2fa, update 2fa and generate new backup codes
export const postVerifySetupTFA = async (req, res, next) => {
  const { TFACode } = req.body;
  const { requireNewBackupCodes } = req.params;
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

  if (requireNewBackupCodes) {
    if (user.TFA.status === false)
      return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);
  } else {
    if (user.TFA.status === true)
      return res.jsend.fail({ TFACode: "2FA already enabled" }, 401);
  }
  if (user.TFA.code != TFACode) {
    user.TFA.attempts++;
    await user.save();
    return res.jsend.fail({ TFACode: "Invalid 2FA token" }, 401);
  }
  if (user.TFA.expiredIn < Date.now())
    return res.jsend.fail({ TFACode: "2FA token expired" }, 401);
  if (user.TFA.attempts > 5)
    return res.jsend.fail({ TFACode: "Too many attempts" }, 429);

  const backupCodes = generateBackupCodes();
  const encryptedBackupCodes = backupCodes.map((BC) => ({
    code: bcrypt.hashSync(BC.code, 12),
    used: false,
  }));

  user.TFA.status = true;
  user.TFA.code = null;
  user.TFA.expiredIn = null;
  user.TFA.attempts = 0;
  user.TFA.backupCodes = encryptedBackupCodes;
  await user.save();

  res.jsend.success({
    message: "2FA setup verified successfully",
    backupCodes: backupCodes.map((BC) => BC.code),
  });
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
  user.TFA.attempts = 0;
  await user.save();

  res.jsend.success({
    message: `2FA send verified successfully to **** ****${phoneNumber.slice(
      8
    )}`,
    expiredIn: TFAExpiredInISO,
  });
};
