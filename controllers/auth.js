import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user.js";

export const postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExisted = await User.findOne({ email });
    if (userExisted)
      return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    const savedUser = await user.save();
    const { password: _, ...userSafeData } = savedUser.toObject();

    res
      .status(201)
      .json({ message: "User registered successfully", user: userSafeData });
  } catch (err) {
    next(err);
  }
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const matchedPasswords = await bcrypt.compare(password, user.password);
    if (!matchedPasswords)
      return res.status(401).json({ message: "Invalid email or password" });

    const userSafeData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const jwtToken = jwt.sign(userSafeData, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "User loggedIn successfully",
      token: jwtToken,
      user: userSafeData,
    });
  } catch (err) {
    next(err);
  }
};
