import { Vonage } from "@vonage/server-sdk";

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

export const sendTFASms = async (to, code) => {
  const from = "JWT-Auth";
  const text = `Your verification number is ${code}. It expires in 3 minutes`;

  try {
    await vonage.sms.send({ to, from, text });
    return "Message sent successfully";
  } catch (err) {
    throw new Error(`There was an error sending the messages: ${err.message}`);
  }
};
