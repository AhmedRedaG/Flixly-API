import { db } from "../../database/models/index.js";
import AppError from "./appError.js";

const { User } = db;

export const getSafeData = (user) => {
  const { password, id, googleId, deleted_at, ...userSafeData } = user.toJSON();
  return userSafeData;
};

export const getUserByIdOrFail = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User not found with the provided ID", 404);

  return user;
};
