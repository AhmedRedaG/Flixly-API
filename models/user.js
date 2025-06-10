import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    refreshTokens: [String],
  },
  {
    timestamps: true,
  }
);

const User = model("users", userSchema);

export default User;
