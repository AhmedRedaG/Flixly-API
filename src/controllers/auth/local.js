import * as localServer from "../../services/auth/local.service.js";
import * as CookieHelper from "../../utilities/CookieHelper.js";

export const postRegister = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await localServer.postRegisterService(name, email, password);
  res.jsend.success(data);
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, userSafeData, method, tempToken } =
    await localServer.postLoginService(email, password);
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success({ accessToken, user: userSafeData, method, tempToken });
};

export const postRefresh = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await localServer.postRefreshService(
    oldRefreshToken
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  res.jsend.success({ accessToken });
};

export const postLogout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const logoutFullCase = req.query.full;
  const data = await localServer.postLogoutService(
    refreshToken,
    logoutFullCase
  );
  res.jsend.success(data);
};
