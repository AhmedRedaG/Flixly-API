import { db } from "../../database/models/index.js";
import AppError from "./appError.js";

const { User } = db;

export const getSafeData = (user, options = { public: false }) => {
  const { password, id, googleId, ...safeData } = user.toJSON();

  if (options.public) {
    const { created_at, updated_at, verified, role, ...publicData } = safeData;
    return publicData;
  }

  return safeData;
};

export const getUserByIdOrFail = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User not found with the provided ID", 404);

  return user;
};
