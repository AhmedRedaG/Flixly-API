import EmailService from "./mailService.js";
import * as configs from "../../../config/index.js";
import { constants } from "../../../config/constants.js";

export default class ResetPasswordOtpMail extends EmailService {
  createMail(user, otp) {
    const expiresInMinutes = Math.ceil(
      constants.otp.OTP_EXPIRES_AFTER_IN_MS / 60000
    );

    const mailOptions = {
      from: `"Flixly" <${configs.env.email.serverEmail}>`,
      to: user.email,
      subject: "Your password reset code",
      text: this.generatePlainTextContent(user, otp, expiresInMinutes),
      html: this.generateHtmlContent(user, otp, expiresInMinutes),
    };

    return mailOptions;
  }

  generatePlainTextContent(user, otp, expiresInMinutes) {
    return `
Hi ${user.firstName},

We received a request to reset your password for your account.

Use this one-time code to reset your password:
${otp}

This code will expire in ${expiresInMinutes} minutes. If you did not request this, please ignore this email.

Thanks,
The Flixly Team

Need help? Contact us at ${configs.env.email.supportEmail}`;
  }

  generateHtmlContent(user, otp, expiresInMinutes) {
    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="text-align: center; color: #333;">🔒 Reset Your Password</h2>
  
  <p style="font-size: 16px; color: #555;">
    Hi <strong>${user.firstName}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #555;">
    Use the following one-time code to reset your password:
  </p>

  <div style="text-align: center; margin: 24px 0;">
    <div style="display: inline-block; letter-spacing: 4px; font-size: 28px; font-weight: 700; padding: 12px 20px; border-radius: 8px; background-color: #111827; color: #ffffff;">
      ${otp}
    </div>
  </div>

  <p style="font-size: 14px; color: #555; text-align: center;">
    This code expires in <strong>${expiresInMinutes} minutes</strong>.
  </p>

  <p style="font-size: 12px; color: #888; text-align: center;">
    If you didn't request a password reset, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    © ${new Date().getFullYear()} Flixly. All rights reserved.<br>
    Need help? Contact us at <a href="mailto:${
      configs.env.email.supportEmail
    }" style="color: #888;">${configs.env.email.supportEmail}</a>
  </p>
</div>`;
  }
}
