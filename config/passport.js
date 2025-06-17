import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.js";

const findOrCreateUser = async (profile) => {
  const oldUser = await User.findOne({ googleId: profile.id });
  if (oldUser) {
    return oldUser.googleId;
  }

  const newUser = await new User({
    name: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id,
  }).save();
  return newUser.googleId;
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
        const userGoogleId = await findOrCreateUser(profile);
        done(userGoogleId, null);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
