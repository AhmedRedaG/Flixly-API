import User from "../models/user.js";

export const getUserByIdOrFail = async (userId, res) => {
  const user = await User.findById(userId);
  if (!user) {
    res.jsend.fail({ user: "No user found" }, 404);
    return null;
  }
  return user;
};
