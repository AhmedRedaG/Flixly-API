import jwtHelper from "../utilities/jwtHelper.js";

const isAuth = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  if (!authorizationHeader)
    return res.jsend.fail(
      { authorizationHeader: "Authorization header is missing" },
      401
    );

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.jsend.fail(
      { authorizationHeader: "Invalid Authorization format" },
      401
    );
  }

  const accessToken = authorizationHeader.split(" ")[1];
  try {
    req.user = jwtHelper.verifyAccessToken(accessToken);
  } catch (err) {
    return res.jsend.fail(
      {
        accessToken:
          err.name === "TokenExpiredError"
            ? "Access token expired"
            : "Access token invalid",
      },
      403
    );
  }

  next();
};

export default isAuth;
