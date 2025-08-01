import * as JwtHelper from "../utilities/jwtHelper.js";
import { extractAuthorizationHeader } from "../utilities/authHelper.js";
import { getUserByIdOrFail } from "../utilities/dataHelper.js";

export const isAuth = async (req, res, next) => {
  const accessToken = extractAuthorizationHeader(req);
  const decoded = JwtHelper.verifyAccessToken(accessToken);
  const userId = decoded.id;

  req.user = await getUserByIdOrFail(userId);

  next();
};

export const isTempAuth = async (req, res, next) => {
  const tempToken = extractAuthorizationHeader(req);
  const decoded = JwtHelper.verifyTempToken(tempToken);
  const userId = decoded.id;

  req.user = await getUserByIdOrFail(userId);

  next();
};
