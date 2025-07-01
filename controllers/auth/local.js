import * as localServer from "../../services/auth/local.service.js";

export const postRegister = async (req, res) => {
  const { name, email, password } = req.body;
  const data = localServer.postRegisterService(name, email, password);
  res.jsend.success(data);
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = localServer.postLoginService(email, password);
  res.jsend.success(data);
};

export const postRefresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const data = localServer.postRefreshService(refreshToken);
  res.jsend.success(data);
};

export const postLogout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const logoutFullCase = req.query.full;
  const data = localServer.postLogoutService(refreshToken, logoutFullCase);
  res.jsend.success(data);
};
