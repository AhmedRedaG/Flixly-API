import nodemailer from "nodemailer";
import { join } from "path";
import { existsSync } from "fs";

import * as configs from "./../config/index.js";

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: configs.env.email.smtpHost,
        port: configs.env.email.smtpPort,
        secure: false,
        auth: {
          user: configs.env.email.serverEmail,
          pass: configs.env.email.serverEmailPass,
        },
      });

      await this.transporter.verify();
    } catch (error) {
      throw new Error(
        `Failed to initialize email transporter: ${error.message}`
      );
    }
  }

  async sendMail(mailOptions) {
    if (!this.transporter) {
      throw new Error("Email transporter not initialized");
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  validateUser(user) {
    if (!user || !user.email || !user.name) {
      throw new Error("Invalid user object: email and name are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      throw new Error("Invalid email format");
    }
  }

  getLogoAttachment() {
    const logoPath = join(process.cwd(), "public", "mailImages", "logo.png");

    if (!existsSync(logoPath)) {
      return null;
    }

    return {
      filename: "logo.png",
      path: logoPath,
      cid: "logo@jwt-auth.com",
    };
  }

  createResetPasswordEmail(user, resetToken) {
    const resetUrl = `${configs.env.frontendUrl}/reset-password/${resetToken}`;
    const logoAttachment = this.getLogoAttachment();

    const mailOptions = {
      from: `"JWT-AUTH" <${configs.env.email.serverEmail}>`,
      to: user.email,
      subject: "Reset Your Password",
      text: this.generatePlainTextContent(user, resetUrl),
      html: this.generateHtmlContent(user, resetUrl, !!logoAttachment),
    };

    if (logoAttachment) {
      mailOptions.attachments = [logoAttachment];
    }

    return mailOptions;
  }

  generatePlainTextContent(user, resetUrl) {
    return `
Hi ${user.name},

We received a request to reset your password for your account.

To reset your password, please click the link below:
${resetUrl}

If you did not request this, please ignore this email. This reset link will expire shortly for your security.

Thanks,
The JWT-AUTH Team

Need help? Contact us at ${configs.env.email.supportEmail}`;
  }

  generateHtmlContent(user, resetUrl, hasLogo) {
    const logoImg = hasLogo
      ? `<img style="width:100px;" src="cid:logo@jwt-auth.com" alt="logo"/>`
      : "";

    return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
  ${logoImg}

  <h2 style="text-align: center; color: #333;">🔒 Reset Your Password</h2>
  
  <p style="font-size: 16px; color: #555;">
    Hi <strong>${user.name}</strong>,
  </p>
  
  <p style="font-size: 16px; color: #555;">
    We received a request to reset your password. Click the button below to choose a new password.
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetUrl}" 
      style="background-color: #4CAF50; color: white; padding: 14px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">
      Reset Password
    </a>
  </div>
  
  <p style="font-size: 14px; color: #888; text-align: center;">
    If you didn't request a password reset, you can safely ignore this email.
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

const emailService = new EmailService();

export const sendResetPasswordMail = async (user, resetToken) => {
  try {
    emailService.validateUser(user);

    const mailOptions = emailService.createResetPasswordEmail(user, resetToken);
    await emailService.sendMail(mailOptions);

    return "Email sent successfully";
  } catch (error) {
    throw new Error(`Failed to send reset password email: ${error.message}`);
  }
};
