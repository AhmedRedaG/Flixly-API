import EmailService from "./mailService.js";
import { env } from "../../../config/env.js";

const { serverEmail, supportEmail } = env.email;
const { clientUrl } = env.url;

export default class VerifyAccountMail extends EmailService {
  createMail(user, verifyToken) {
    const verifyUrl = `${clientUrl}/verify-account/${verifyToken}`;

    const mailOptions = {
      from: `"Flixly" <${serverEmail}>`,
      to: user.email,
      subject: "Verify Your Account",
      text: this.generatePlainTextContent(user, verifyUrl),
      html: this.generateHtmlContent(user, verifyUrl),
    };

    return mailOptions;
  }

  generatePlainTextContent(user, verifyUrl) {
    return `
Hi ${user.firstName},

Welcome to Flixly! We're excited to have you on board.

To complete your account setup, please verify your email address by clicking the link below:
${verifyUrl}

If you did not create this account, please ignore this email. This verification link will expire shortly for your security.

Thanks,
The Flixly Team

Need help? Contact us at ${supportEmail}`;
  }

  generateHtmlContent(user, verifyUrl) {
    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  <h2 style="text-align: center; color: #333;">✅ Verify Your Account</h2>
  
  <p style="font-size: 16px; color: #555;">
    Hi <strong>${user.firstName}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #555;">
    Welcome to Flixly! We're excited to have you on board. To complete your account setup, please verify your email address.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verifyUrl}" 
      style="background-color: #2196F3; color: white; padding: 14px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
      Verify Account
    </a>
  </div>
  
  <p style="font-size: 14px; color: #888; text-align: center;">
    If you didn't create this account, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    © ${new Date().getFullYear()} Flixly. All rights reserved.<br>
    Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #888;">${supportEmail}</a>
  </p>
</div>`;
  }
}
