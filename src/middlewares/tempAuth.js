import * as JwtHelper from "../utilities/jwtHelper.js";
import AppError from "../utilities/appError.js";

const tempAuth = async (req, res, next) => {
  const { tempToken } = req.body;
  if (!tempToken) throw new AppError("Missing temp token", 422);

  try {
    req.user = JwtHelper.verifyTempToken(tempToken);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Temp token expired"
        : "Temp token invalid";
    throw new AppError(message, 403);
  }

  next();
};

export default tempAuth;
