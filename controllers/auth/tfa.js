import crypto from "crypto";

import User from "../../models/user.js";

const TFA_DURATION = 1000 * 60 + 3; // 3 minutes

export const postEnableTFA = async (req, res, next) => {
  const { phoneNumber } = req.body;

  const TFACode = crypto.randomInt(100000, 999999);
  const TFADuration = Date.now() + TFA_DURATION;

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user)
    return res.jsend.fail(
      {
        user: "no user found",
      },
      404
    );

  // send code with Twillo to the phone number

  user.phoneNumber = phoneNumber;
  user.TFA.code = TFACode;
  user.TFA.duration = TFADuration;
  await user.save();

  res.jsend.success({ phoneNumber, TFADuration });
};

export const postVerifySetupTFA = (req, res, next) => {
  // check the code and duration from db
  // activate tfa if true
  // return done
};
