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
