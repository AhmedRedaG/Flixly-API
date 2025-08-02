import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import * as configs from "./index.js";
import { db } from "../database/models/index.js";

const { clientId, clientSecret } = configs.env.google;
const { User } = db;

const generateUsername = (email) => {
  const [name, domain] = email.split("@");
  return `${name}${Math.floor(Math.random() * 10000)}`;
};

const findOrCreateUser = async (profile) => {
  const oldUser = await User.findOne({ where: { googleId: profile.id } });
  if (oldUser) {
    return oldUser;
  }

  let username;
  while (true) {
    username = generateUsername(profile.emails[0].value);
    let userExisted = await User.findOne({ where: { username } });
    if (!userExisted) {
      break;
    }
  }

  const newUser = await User.create({
    firstName: profile.name.givenName,
    lastName: profile.name.familyName || "Flixly", // in case of no family name
    username,
    email: profile.emails[0].value,
    googleId: profile.id,
    verified: true,
    avatar: profile.photos[0].value,
  });
  return newUser;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
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
