import User from "../../models/user.js";
import JwtHelper from "../../utilities/JwtHelper.js";
import CookieHelper from "../../utilities/cookieHelper.js";

export const authWithGoogle = async (req, res, next) => {
  const userGoogleId = req.user; // google id only
  const user = await User.findOne({ googleId: userGoogleId });

  const userSafeData = JwtHelper.getSafeData(user);
  const refreshToken = JwtHelper.createRefreshToken(userSafeData);
  CookieHelper.createRefreshTokenCookie(res, refreshToken);

  user.refreshTokens.push(refreshToken);
  await user.save();

  const accessToken = JwtHelper.createAccessToken(userSafeData);
  // res.redirect(`http://frontend/oauth-success?token=${accessToken}`);
  res.jsend.success({ accessToken, user: userSafeData });
};
