import User from "../models/user.js";
import AppError from "./AppError.js";

export async function getUserByIdOrFail(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("No user found", 404);
  }
  return user;
}

export function getSafeData(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
