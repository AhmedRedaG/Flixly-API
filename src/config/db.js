import mongoose from "mongoose";

import * as configs from "./index.js";

const MONGODB_URI = configs.env.mongoUri;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
