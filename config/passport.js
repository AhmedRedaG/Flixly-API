import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import * as configs from "./index.js";
import User from "../src/models/user.js";

const findOrCreateUser = async (profile) => {
  const oldUser = await User.findOne({ googleId: profile.id });
  if (oldUser) {
    return oldUser;
  }

  const newUser = await new User({
    name: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id,
  }).save();
  return newUser;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: configs.env.google.clientId,
      clientSecret: configs.env.google.clientSecret,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
