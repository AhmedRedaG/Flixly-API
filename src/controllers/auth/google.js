import * as googleServer from "../../services/auth/google.service.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";

export const authWithGoogle = async (req, res) => {
  const userGoogleId = req.user; // google id only
  const { refreshToken, ...data } = await googleServer.authWithGoogleService(
    userGoogleId
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  // res.redirect(`http://frontend/oauth-success?token=${accessToken}`);
  res.jsend.success(data);
};
