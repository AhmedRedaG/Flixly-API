import nodemailer from "nodemailer";
import { join } from "path";
import { existsSync } from "fs";

import * as configs from "../../../config/index.js";

export default class EmailService {
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
}
