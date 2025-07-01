import User from "../models/user.js";
import AppError from "./AppError.js";

export const getUserByIdOrFail = async (userId, res) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("No user found", 404);
  }
  return user;
};
