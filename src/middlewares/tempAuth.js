import * as JwtHelper from "../utilities/jwtHelper.js";

const tempAuth = async (req, res, next) => {
  const { tempToken } = req.body;
  if (!tempToken) return res.jsend.fail({ tempToken: "Missing temp token" });

  try {
    req.user = JwtHelper.verifyTempToken(tempToken);
  } catch (err) {
    return res.jsend.fail(
      {
        tempToken:
          err.name === "TokenExpiredError"
            ? "Temp token expired"
            : "Temp token invalid",
      },
      403
    );
  }

  next();
};

export default tempAuth;
