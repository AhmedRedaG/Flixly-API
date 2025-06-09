import bcrypt from "bcrypt";

import User from "../models/user.js";

export const postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();
    const { password: _, ...userSafeData } = savedUser.toObject();

    res
      .status(201)
      .json({ message: "User registered successfully", data: userSafeData });
  } catch (err) {
    next(err);
  }
};

export const postLogin = (req, res, next) => {};
