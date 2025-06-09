import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  if (!authorizationHeader)
    return res.status(401).json({ message: "Authorization header is missing" });

  if (!authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }

  const token = authorizationHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }

  next();
};

export default isAuth;
