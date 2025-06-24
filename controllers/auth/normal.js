import bcrypt from "bcrypt";

import User from "../../models/user.js";
import JwtHelper from "../../utilities/JwtHelper.js";
import CookieHelper from "../../utilities/cookieHelper.js";

export const postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExisted = await User.findOne({ email });
  if (userExisted)
    return res.jsend.fail({ email: "Email already in use" }, 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({ name, email, password: hashedPassword });
  const user = await newUser.save();
  const userSafeData = JwtHelper.getSafeData(user);

  res.jsend.success({ user: userSafeData });
};

export const postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.jsend.fail({ email: "Invalid email" }, 401);

  if (!user.password)
    return res.jsend.fail(
      { auth: "This account was registered with Google." },
      401
    );

  const matchedPasswords = await bcrypt.compare(password, user.password);
  if (!matchedPasswords)
    return res.jsend.fail({ password: "Invalid password" }, 401);

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  res.jsend.success({ accessToken, user: userSafeData });
};

export const postLogout = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.jsend.success();
  }

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    CookieHelper.clearRefreshTokenCookie(res);
    return res.jsend.success();
  }

  const user = await User.findById(userId);
  if (!user) return res.jsend.fail({ user: "User not found" }, 404);

  const logoutFullCase = req.query.full;
  if (!logoutFullCase)
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  else user.refreshTokens = [];
  await user.save();

  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success();
};
