import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    verified: { type: Boolean, default: false },
    refreshTokens: [String],
    resetToken: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = model("users", userSchema);

export default User;
