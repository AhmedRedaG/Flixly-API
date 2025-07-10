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

  try {
    req.user = JwtHelper.verifyAccessToken(accessToken);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Access token expired"
        : err.name === "JsonWebTokenError"
        ? "Access token invalid"
        : "Authentication failed";

    throw new AppError(message, 403);
  }

  next();
};

export default isAuth;
