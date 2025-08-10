import * as authServer from "../services/auth.js";
import * as CookieHelper from "../utilities/cookieHelper.js";

export const register = async (req, res) => {
  const { firstName, lastName, username, email, password, bio } = req.body;
  // still need to add avatar endpoint
  const data = await authServer.postRegisterService(
    firstName,
    lastName,
    username,
    email,
    password,
    bio
  );
  res.jsend.success(data, 201);
};

export const verifyMail = async (req, res) => {
  const { verifyToken } = req.params;
  if (!verifyToken) throw new AppError("Verify token is missing");
  const { refreshToken, ...data } = await await authServer.verifyMailService(
    verifyToken
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success(data);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { refreshToken, ...data } = await authServer.postLoginService(
    email,
    password
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success(data);
};

export const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { refreshToken, ...data } = await authServer.postRefreshService(
    oldRefreshToken
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success(data);
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const logoutFullCase = req.query.full;
  const data = await authServer.postLogoutService(refreshToken, logoutFullCase);
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};

export const authWithGoogle = async (req, res) => {
  const user = req.user; // google id only
  const { refreshToken, ...data } = await authServer.authWithGoogleService(
    user
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  // res.redirect(`${configs.env.frontendUrl}/oauth-success/${accessToken}`);
  res.jsend.success(data);
};

export const requestResetPasswordMail = async (req, res) => {
  const { email } = req.body;
  const data = await authServer.requestResetPasswordMailService(email);
  res.jsend.success(data);
};

export const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  const data = await authServer.resetPasswordService(email, otp, password);
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};
