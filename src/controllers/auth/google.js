import * as googleServer from "../../services/auth/google.service.js";
import * as CookieHelper from "../../utilities/CookieHelper.js";

export const authWithGoogle = async (req, res, next) => {
  const userGoogleId = req.user; // google id only
  const { accessToken, refreshToken, userSafeData } =
    googleServer.authWithGoogleService(userGoogleId);
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  // res.redirect(`http://frontend/oauth-success?token=${accessToken}`);
  res.jsend.success({ accessToken, user: userSafeData });
};
