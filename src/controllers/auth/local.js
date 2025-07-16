import * as localServer from "../../services/auth/local.service.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await localServer.postRegisterService(name, email, password);
  res.jsend.success(data, 201);
};

export const verifyMail = async (req, res) => {
  const { verifyToken } = req.params;
  if (!verifyToken) throw new AppError("Verify token is missing");
  const { refreshToken, ...data } = await await localServer.verifyMailService(
    verifyToken
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success(data);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const { refreshToken, ...data } = await localServer.postLoginService(
    email,
    password
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success(data);
};

export const refresh = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { refreshToken, ...data } = await localServer.postRefreshService(
    oldRefreshToken
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success(data);
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const logoutFullCase = req.query.full;
  const data = await localServer.postLogoutService(
    refreshToken,
    logoutFullCase
  );
  CookieHelper.clearRefreshTokenCookie(res);
  res.jsend.success(data);
};
