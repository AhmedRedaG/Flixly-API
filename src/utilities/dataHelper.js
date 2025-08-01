import User from "../../database/models/user.js";
import AppError from "./appError.js";

export const getUserByIdOrFail = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found with the provided ID", 404);
  }
  return user;
};

export const getSafeData = (user) => {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    bio: user.bio,
    role: user.role,
    verified: user.verified,
  };
};
