import { v2 as cloudinary } from "cloudinary";

import * as configs from "./index.js";

const { cloudName, apiKey, apiSecret } = configs.env.cloudinary;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
