import * as JwtHelper from "../utilities/jwtHelper.js";
import AppError from "../utilities/appError.js";

const tempAuth = async (req, res, next) => {
  const { tempToken } = req.body;
  if (!tempToken) throw new AppError("Missing temp token", 422);

  req.user = JwtHelper.verifyTempToken(tempToken);

  next();
};

export default tempAuth;
