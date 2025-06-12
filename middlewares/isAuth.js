import jwt from "jsonwebtoken";

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

  const token = authorizationHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    return res.jsend.fail(
      {
        accessToken:
          err.name === "TokenExpiredError"
            ? "Refresh token expired"
            : "Refresh token invalid",
      },
      403
    );
  }

  next();
};

export default isAuth;
