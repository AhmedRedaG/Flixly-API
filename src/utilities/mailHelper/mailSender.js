import ResetPasswordMail from "./resetPasswordMail.js";
import VerifyAccountMail from "./verifyAccountMail.js";

const mailClasses = {
  resetPassword: ResetPasswordMail,
  verifyAccount: VerifyAccountMail,
};

export const sendMailService = async (user, token, mailType) => {
  if (!mailClasses[mailType]) {
    throw new Error(`Unsupported mail type: ${mailType}`);
  }

  try {
    const MailClass = mailClasses[mailType];
    const mailInstance = new MailClass();
    const mailOptions = mailInstance.createMail(user, token);
    await mailInstance.sendMail(mailOptions);

  } catch (error) {
    throw new Error(`Failed to send ${mailType} email: ${error.message}`);
  }
};

export const sendResetPasswordMail = (user, resetToken) =>
  sendMailService(user, resetToken, "resetPassword");
export const sendVerifyTokenMail = (user, verifyToken) =>
  sendMailService(user, verifyToken, "verifyAccount");
