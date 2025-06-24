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
    role: { type: String, default: "user" },
    refreshTokens: [String],
    resetToken: { type: String },
    phoneNumber: { type: String },
    TFA: {
      type: {
        status: { type: Boolean, default: false },
        code: { type: Number },
        duration: { type: Number },
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = model("users", userSchema);

export default User;
