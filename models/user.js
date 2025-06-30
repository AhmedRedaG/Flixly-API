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
    refreshTokens: [String],
    resetToken: { type: String },
    TFA: {
      type: {
        status: { type: Boolean, default: false },
        method: {
          type: String,
          enum: ["sms", "totp"],
          default: null,
        },
        sms: {
          status: { type: Boolean, default: false },
          number: { type: String },
          code: { type: String },
          expiredAt: { type: Date },
          lastSentAt: { type: Date },
          attempts: { type: Number, default: 0 },
          locked: { type: Boolean, default: false },
          lockedUntil: { type: Date },
          _id: false,
        },
        totp: {
          status: { type: Boolean, default: false },
          secret: { type: String },
          attempts: { type: Number, default: 0 },
          locked: { type: Boolean, default: false },
          lockedUntil: { type: Date },
          _id: false,
        },
        backupCodes: [
          {
            code: { type: String },
            used: { type: Boolean, default: false },
            _id: false,
          },
        ],
      },
      default: {},
      _id: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("users", userSchema);

export default User;
