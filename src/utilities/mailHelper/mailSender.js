import ResetPasswordOtpMail from "./resetPasswordMail.js";
import VerifyAccountMail from "./verifyAccountMail.js";

const mailClasses = {
  resetPasswordOtp: ResetPasswordOtpMail,
  verifyAccount: VerifyAccountMail,
};

export const sendMailService = async (user, payload, mailType) => {
  if (!mailClasses[mailType]) {
    throw new Error(`Unsupported mail type: ${mailType}`);
  }

  try {
    const MailClass = mailClasses[mailType];
    const mailInstance = new MailClass();
    const mailOptions = mailInstance.createMail(user, payload);
    await mailInstance.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Failed to send ${mailType} email: ${error.message}`);
  }
};

export const sendResetPasswordOtpMail = (user, otp) =>
  sendMailService(user, otp, "resetPasswordOtp");
export const sendVerifyTokenMail = (user, verifyToken) =>
  sendMailService(user, verifyToken, "verifyAccount");
