import * as JwtHelper from "../utilities/jwtHelper.js";
import AppError from "../utilities/appError.js";

const tempAuth = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    throw new AppError("Authorization header is missing", 401);
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    throw new AppError("Invalid Authorization format", 401);
  }

  const tempToken = authorizationHeader.split(" ")[1];

  req.user = JwtHelper.verifyTempToken(tempToken);

  next();
};

export default tempAuth;
