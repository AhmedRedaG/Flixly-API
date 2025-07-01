import crypto from "crypto";

import { sendTFASms } from "../../../utilities/smsSender.js";
import { getUserByIdOrFail } from "../../../utilities/dataHelper.js";
import AppError from "../../../utilities/AppError.js";

const TFA_DURATION = 1000 * 60 * 5; // 5 minutes
const SMS_DURATION = 1000 * 60 * 15; // 15 minutes

export const sendSmsVerificationCodeService = async (userId) => {
  const user = await getUserByIdOrFail(userId);

  if (
    user.TFA.sms.lastSentAt &&
    user.TFA.sms.lastSentAt > new Date(Date.now() - SMS_DURATION)
  ) {
    throw new AppError("Can't send SMS right now, try again later", 429);
  }

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredAt = new Date(Date.now() + TFA_DURATION);
  const phoneNumber = user.TFA.sms.number;

  // await sendTFASms(phoneNumber, TFACode);
  console.log(">>>>>>>>>>>> " + TFACode);

  user.TFA.sms.code = TFACode;
  user.TFA.sms.expiredAt = TFAExpiredAt;
  user.TFA.sms.lastSentAt = new Date();
  user.TFA.sms.attempts = 0;
  await user.save();

  return {
    phoneNumber: `*******${phoneNumber.slice(9)}`,
    TFAExpiredAt,
  };
};
