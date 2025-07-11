import mongoose from "mongoose";

import * as configs from "./index.js";

const MONGODB_URI = configs.env.mongoUri[configs.env.nodeEnv];

export const connectDB = async () => {
  try {
    return await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
