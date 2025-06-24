import crypto from "crypto";

import User from "../../models/user.js";
import { sendTFASms } from "../../utilities/smsSender.js";

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
        user: "no user found",
      },
      404
    );

  await sendTFASms(phoneNumber, TFACode);

  user.phoneNumber = phoneNumber;
  user.TFA.code = TFACode;
  user.TFA.expiredIn = TFAExpiredIn;
  await user.save();

  res.jsend.success({
    phoneNumber,
    expiredIn: TFAExpiredInISO,
  });
};

export const postVerifySetupTFA = (req, res, next) => {
  // check the code and duration from db
  // activate tfa if true
  // return done
};
