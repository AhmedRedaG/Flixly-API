import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

class JwtHelper {
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
    return this.createToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_EXPIRES_IN
    );
  }

  static createRefreshToken(payload) {
    return this.createToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      REFRESH_TOKEN_EXPIRES_IN
    );
  }

  static verifyToken(token, key) {
    return jwt.verify(token, key);
  }

  static verifyAccessToken(token) {
    return this.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
  }

  static verifyRefreshToken(token) {
    return this.verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
  }

  static createRefreshTokenCookie(res, refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/v1/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

export default JwtHelper;
