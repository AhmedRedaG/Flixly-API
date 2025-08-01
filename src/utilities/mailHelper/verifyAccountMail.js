import EmailService from "./mailService.js";
import * as configs from "../../../config/index.js";

export default class VerifyAccountMail extends EmailService {
  createMail(user, verifyToken) {
    const verifyUrl = `${configs.env.frontendUrl}/verify-account/${verifyToken}`;
    const logoAttachment = this.getLogoAttachment();

    const mailOptions = {
      from: `"JWT-AUTH" <${configs.env.email.serverEmail}>`,
      to: user.email,
      subject: "Verify Your Account",
      text: this.generatePlainTextContent(user, verifyUrl),
      html: this.generateHtmlContent(user, verifyUrl, !!logoAttachment),
    };

    if (logoAttachment) {
      mailOptions.attachments = [logoAttachment];
    }

    return mailOptions;
  }

  generatePlainTextContent(user, verifyUrl) {
    return `
Hi ${user.firstName} ${user.lastName},

Welcome to JWT-AUTH! We're excited to have you on board.

To complete your account setup, please verify your email address by clicking the link below:
${verifyUrl}

If you did not create this account, please ignore this email. This verification link will expire shortly for your security.

Thanks,
The JWT-AUTH Team

Need help? Contact us at ${configs.env.email.supportEmail}`;
  }

  generateHtmlContent(user, verifyUrl, hasLogo) {
    const logoImg = hasLogo
      ? `<img style="width:50px;" src="cid:logo@jwt-auth.com" alt="logo"/>`
      : "";

    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  ${logoImg}

  <h2 style="text-align: center; color: #333;">✅ Verify Your Account</h2>
  
  <p style="font-size: 16px; color: #555;">
    Hi <strong>${user.firstName} ${user.lastName}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #555;">
    Welcome to JWT-AUTH! We're excited to have you on board. To complete your account setup, please verify your email address.
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
    © ${new Date().getFullYear()} JWT-AUTH. All rights reserved.<br>
    Need help? Contact us at <a href="mailto:${
      configs.env.email.supportEmail
    }" style="color: #888;">${configs.env.email.supportEmail}</a>
  </p>
</div>`;
  }
}
