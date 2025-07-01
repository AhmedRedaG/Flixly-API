import * as googleServer from "../../services/auth/google.service.js";

export const authWithGoogle = async (req, res, next) => {
  const userGoogleId = req.user; // google id only
  const data = googleServer.authWithGoogleService(userGoogleId);
  // res.redirect(`http://frontend/oauth-success?token=${accessToken}`);
  res.jsend.success(data);
};
