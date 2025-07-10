import mongoose from "mongoose";

import * as configs from "./index.js";

const MONGODB_URI = configs.env.mongoUri[configs.env.nodeEnv];

let mongooseConnection;

export const connectDB = async () => {
  try {
    mongooseConnection = await mongoose.connect(MONGODB_URI);
    console.log(`${configs.env.nodeEnv} MongoDB connected successfully`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

export { mongooseConnection };
