import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "../models/user.js";

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
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        done(user, null);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
