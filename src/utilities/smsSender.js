import { Vonage } from "@vonage/server-sdk";

import * as configs from "./../config/index.js";

const vonage = new Vonage({
  apiKey: configs.env.sms.vonageApiKey,
  apiSecret: configs.env.sms.vonageApiSecret,
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
