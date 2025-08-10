import { db } from "../../database/models/index.js";
import AppError from "./appError.js";

const { User } = db;

export const getSafeData = (user) => {
  const { password, ...safeData } = user.toJSON();
  return safeData;
};

export const getUserByIdOrFail = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password"],
    },
  });
  if (!user) throw new AppError("User not found with the provided ID", 404);

  return user;
};
