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
    const newUser = new User({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const userSafeData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

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

    user.refreshTokens.push(refreshToken);
    const saveNewRefreshToken = await user.save();

    const accessToken = jwt.sign(
      userSafeData,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.status(200).json({
      message: "User loggedIn successfully",
      accessToken,
      user: userSafeData,
    });
  } catch (err) {
    next(err);
  }
};

export const postRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refreshToken exist" });

  let userId;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    userId = decoded._id;
  } catch (err) {
    return res.status(403).json({
      message:
        err.name === "TokenExpiredError"
          ? "Refresh token expired"
          : "Refresh token invalid",
    });
  }

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(401).json({ message: "User not found" });

    const refreshTokenIndex = user.refreshTokens.findIndex(
      (rf) => rf === refreshToken
    );
    if (refreshTokenIndex === -1)
      return res.status(403).json({ message: "Invalid refresh token" });

    const userSafeData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newRefreshToken = jwt.sign(
      userSafeData,
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    user.refreshTokens[refreshTokenIndex] = newRefreshToken;
    user.save();

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
    next(err);
  }
};

export const postLogout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(200).json({ message: "User already logged out" });
  }

  let userId;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    userId = decoded._id;
  } catch (err) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
    });
    return res.sendStatus(204);
  }

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(401).json({ message: "User not found" });

    const logoutFullCase = req.query.full;
    if (!logoutFullCase)
      user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt !== refreshToken
      );
    else user.refreshTokens = [];
    user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    next(err);
  }
};
