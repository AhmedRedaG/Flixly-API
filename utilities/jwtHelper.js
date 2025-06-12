import jwt from "jsonwebtoken";

class jwtHelper {
  static getSafeData(user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  static createToken(payload, key, expiresIn) {
    return jwt.sign(payload, key, { expiresIn });
  }
  static createAccessToken(payload) {
    return this.createToken(payload, process.env.ACCESS_TOKEN_SECRET, "15m");
  }
  static createRefreshToken(payload) {
    return this.createToken(payload, process.env.REFRESH_TOKEN_SECRET, "7d");
  }

  static verifyToken(token, key) {
    return jwt.verify(token, key);
  }
  static verifyAccessToken(token) {
    return this.verifyToken(token, process.env.ACCESS_TOKEN_SECRET, "15m");
  }
  static verifyRefreshToken(token) {
    return this.verifyToken(token, process.env.REFRESH_TOKEN_SECRET, "7d");
  }

  static createRefreshTokenCookie(res, refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  static clearRefreshTokenCookie(res) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
    });
  }
}

export default jwtHelper;
