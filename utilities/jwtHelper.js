import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "2h"; // for testing
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const RESET_TOKEN_EXPIRES_IN = "1h";
const TEMP_TOKEN_EXPIRES_IN = "10m";

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
  static createResetToken(payload) {
    return this.createToken(
      payload,
      process.env.RESET_TOKEN_SECRET,
      RESET_TOKEN_EXPIRES_IN
    );
  }
  static createTempToken(payload) {
    return this.createToken(
      payload,
      process.env.TEMP_TOKEN_SECRET,
      TEMP_TOKEN_EXPIRES_IN
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
  static verifyResetToken(token) {
    return this.verifyToken(token, process.env.RESET_TOKEN_SECRET);
  }
  static verifyTempToken(token) {
    return this.verifyToken(token, process.env.TEMP_TOKEN_SECRET);
  }
}

export default JwtHelper;
