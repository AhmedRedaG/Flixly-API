import JwtHelper from "../../utilities/JwtHelper.js";
import CookieHelper from "../../utilities/cookieHelper.js";
import { getUserByIdOrFail } from "../../utilities/dbHelper.js";

export const postRefresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.jsend.fail({ refreshToken: "No refreshToken exist" }, 401);

  let userId;
  try {
    const decoded = JwtHelper.verifyRefreshToken(refreshToken);
    userId = decoded._id;
  } catch (err) {
    return res.jsend.fail(
      {
        refreshToken:
          err.name === "TokenExpiredError"
            ? "Refresh token expired"
            : "Refresh token invalid",
      },
      403
    );
  }

  const user = await getUserByIdOrFail(userId, res);
  if (!user) return;

  const refreshTokenIndex = user.refreshTokens.findIndex(
    (rf) => rf === refreshToken
  );
  if (refreshTokenIndex === -1)
    return res.jsend.fail({ refreshTokens: "Invalid refresh token" }, 403);

  const userSafeData = JwtHelper.getSafeData(user);
  const newRefreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, newRefreshToken);

  user.refreshTokens[refreshTokenIndex] = newRefreshToken;
  user.refreshTokens = user.refreshTokens.slice(-5);
  await user.save();

  const newAccessToken = JwtHelper.createAccessToken(userSafeData);
  res.jsend.success({ accessToken: newAccessToken });
};
