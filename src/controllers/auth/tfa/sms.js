import * as smsServer from "../../../services/auth/tfa/sms.service.js";

const TFA_DURATION = 1000 * 60 * 5; // 5 minutes
const SMS_DURATION = 1000 * 60 * 15; // 15 minutes

export const sendSmsVerificationCode = async (req, res) => {
  const userId = req.user._id;
  const data = smsServer.sendSmsVerificationCodeService(userId);
  res.jsend.success(data);
};
