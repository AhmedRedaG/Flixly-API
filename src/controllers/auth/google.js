import * as googleServer from "../../services/auth/google.js";
import * as CookieHelper from "../../utilities/cookieHelper.js";

export const authWithGoogle = async (req, res) => {
  const user = req.user; // google id only
  const { refreshToken, ...data } = await googleServer.authWithGoogleService(
    user
  );
  CookieHelper.createRefreshTokenCookie(refreshToken, res);
  // res.redirect(`${configs.env.frontendUrl}/oauth-success/${accessToken}`);
  res.jsend.success(data);
};
