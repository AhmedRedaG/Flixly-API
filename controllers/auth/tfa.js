import crypto from "crypto";

import User from "../../models/user.js";
import { sendTFASms } from "../../utilities/smsSender.js";
import { updateUserTFAData, verifyTFACode } from "../../utilities/tfaHelper.js";
import { getUserByIdOrFail } from "../../utilities/dbHelper.js";

const TFA_DURATION = 1000 * 60 + 3; // 3 minutes

// create and update 2fa
export const setupTFA = async (req, res, next) => {
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

export const enableTFA = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === true)
    return res.jsend.fail({ TFACode: "2FA already enabled" }, 401);

  const verifyTFACodeResult = await verifyTFACode(user, TFACode, res);
  if (!verifyTFACodeResult) return;

  let rawBackupCodes;
  ({ user, rawBackupCodes } = await updateUserTFAData(user, false, res));
  await user.save();

  res.jsend.success({
    message: "2FA enabled successfully",
    backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const updateTFA = async (req, res) => {
  const { TFACode } = req.body;
  if (!TFACode) return res.jsend.fail({ TFACode: "Missing 2FA token" });

  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.status === false)
    return res.jsend.fail({ TFACode: "2FA is not enabled" }, 401);

  const verifyTFACodeResult = await verifyTFACode(user, TFACode, res);
  if (!verifyTFACodeResult) return;

  let rawBackupCodes;
  ({ user, rawBackupCodes } = await updateUserTFAData(user, false, res));
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

  ({ user } = await updateUserTFAData(user, true, res));
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

  let rawBackupCodes;
  ({ user, rawBackupCodes } = await updateUserTFAData(user, false, res));
  await user.save();

  res.jsend.success({
    message: "2FA verified successfully",
    backupCodes: rawBackupCodes.map((code) => code.code),
  });
};

export const requestTFACode = async (req, res, next) => {
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
