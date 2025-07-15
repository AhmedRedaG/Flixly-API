import * as JwtHelper from "../utilities/jwtHelper.js";
import { extractAuthorizationHeader } from "../utilities/authHelper.js";

export const isAuth = async (req, res, next) => {
  const accessToken = extractAuthorizationHeader(req);
  req.user = JwtHelper.verifyAccessToken(accessToken);

  next();
};

export const isTempAuth = async (req, res, next) => {
  const tempToken = extractAuthorizationHeader(req);
  req.user = JwtHelper.verifyTempToken(tempToken);

  next();
};
