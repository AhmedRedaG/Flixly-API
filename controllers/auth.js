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
    const accessToken = jwt.sign(
      userSafeData,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      userSafeData,
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
      message: "User loggedIn successfully",
      accessToken,
      user: userSafeData,
    });
  } catch (err) {
    next(err);
  }
};

export const postRefresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refreshToken exist" });

  try {
    const user = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const { iat, exp, ...userSafeData } = user;
    const newAccessToken = jwt.sign(
      userSafeData,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.status(200).json({
      message: "New accessToken created successfully",
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export const postLogout = (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(200).json({ message: "User already logged out" });
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
  });
  return res.status(200).json({ message: "User logged out successfully" });
};
