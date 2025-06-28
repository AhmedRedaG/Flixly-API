import crypto from "crypto";
import { sendTFASms } from "../../../utilities/smsSender.js";
import { getUserByIdOrFail } from "../../../utilities/dbHelper.js";

const TFA_DURATION = 1000 * 60 * 5;

export const sendSmsVerificationCode = async (req, res) => {
  const user = await getUserByIdOrFail(req.user._id, res);
  if (!user) return;

  if (user.TFA.sms.status === false)
    return res.jsend.fail({ phoneNumber: "2FA not enabled" }, 401);

  const TFACode = crypto.randomInt(100000, 999999);
  const TFAExpiredIn = Date.now() + TFA_DURATION;
  const phoneNumber = user.TFA.sms.number;

  // await sendTFASms(phoneNumber, TFACode);
  console.log(">>>>>>>>>>>> " + TFACode);

  user.TFA.sms.code = TFACode;
  user.TFA.sms.expiredIn = TFAExpiredIn;
  user.TFA.sms.attempts = 0;
  await user.save();

  res.jsend.success({
    message: `2FA sent successfully to *******${phoneNumber.slice(9)}`,
    expiredIn: new Date(TFAExpiredIn).toISOString(),
  });
};
