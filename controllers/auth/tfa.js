import crypto from "crypto";

import User from "../../models/user.js";

export const postEnableTFA = (req, res, next) => {
  // create random code
  // send code with Twillo to the phone number
  // save number, code and duration to db
  // return done
};

export const postVerifySetupTFA = (req, res, next) => {
  // check the code and duration from db
  // activate tfa if true
  // return done
};
