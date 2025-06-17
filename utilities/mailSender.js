import nodemailer from "nodemailer";

const sendMail = async (mail) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SERVER_MAIL,
      pass: process.env.SERVER_MAIL_PASS,
    },
  });

  await transporter.sendMail(mail);
};

export const sendResetPasswordMail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const mail = {
    from: '"JWT-AUTH" <process.env.SERVER_MAIL>',
    to: user.email,
    subject: "Reset Your Password",
    text: `
Hi ${user.name},

We received a request to reset your password for your account on YourApp.

To reset your password, please click the link below:
${resetUrl}

If you did not request this, please ignore this email. This reset link will expire shortly for your security.

Thanks,
The YourApp Team

Need help? Contact us at support@yourapp.com`,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
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
    If you didn’t request a password reset, you can safely ignore this email.
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    © ${new Date().getFullYear()} YourApp. All rights reserved.<br>
    Need help? Contact us at <a href="mailto:support@yourapp.com" style="color: #888;">support@yourapp.com</a>
  </p>
</div>
`,
  };

  try {
    await sendMail(mail);
    return "Email sent successfully";
  } catch (err) {
    throw new Error(`Failed to send email: ${err.message}`);
  }
};
