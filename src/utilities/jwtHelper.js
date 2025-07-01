import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = "2h"; // for testing
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const RESET_TOKEN_EXPIRES_IN = "1h";
const TEMP_TOKEN_EXPIRES_IN = "10m";

export function getSafeData(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function createToken(payload, key, expiresIn) {
  return jwt.sign(payload, key, { expiresIn });
}

export function createAccessToken(payload) {
  return createToken(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN
  );
}
export function createRefreshToken(payload) {
  return createToken(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN
  );
}
export function createResetToken(payload) {
  return createToken(
    payload,
    process.env.RESET_TOKEN_SECRET,
    RESET_TOKEN_EXPIRES_IN
  );
}
export function createTempToken(payload) {
  return createToken(
    payload,
    process.env.TEMP_TOKEN_SECRET,
    TEMP_TOKEN_EXPIRES_IN
  );
}

function verifyToken(token, key) {
  return jwt.verify(token, key);
}

export function verifyAccessToken(token) {
  return verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
}
export function verifyRefreshToken(token) {
  return verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
}
export function verifyResetToken(token) {
  return verifyToken(token, process.env.RESET_TOKEN_SECRET);
}
export function verifyTempToken(token) {
  return verifyToken(token, process.env.TEMP_TOKEN_SECRET);
}
