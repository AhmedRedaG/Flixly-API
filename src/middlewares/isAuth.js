import * as JwtHelper from "../utilities/jwtHelper.js";
import AppError from "../utilities/appError.js";

const isAuth = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");

  if (!authorizationHeader) {
    throw new AppError("Authorization header is missing", 401);
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    throw new AppError("Invalid Authorization format", 401);
  }

  const accessToken = authorizationHeader.split(" ")[1];

  req.user = JwtHelper.verifyAccessToken(accessToken);

  next();
};

export default isAuth;
