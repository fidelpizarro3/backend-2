import passport from "passport";
import local from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/user.repository.js";
import UserDTO from "../dtos/user.dto.js";
import { createHash, isValidPassword } from "../utils.js";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        try {
          const userFound = await UserRepository.getUserByEmail(username);
          if (userFound) {
            return done(null, false);
          }
          const newUser = await UserRepository.createUser({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: username,
            password: createHash(password),
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      async (req, username, password, done) => {
        try {
          const userExist = await UserRepository.getUserByEmail(username);
          if (!userExist || !isValidPassword(password, userExist.password)) {
            return done(null, false);
          }

          req.session.user = new UserDTO(userExist);
          return done(null, userExist);
        } catch (error) {
          return done(error.message);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: githubClientId,
        clientSecret: githubClientSecret,
        callbackURL: "http://localhost:3000/api/sessions/github/callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await UserRepository.getUserByEmail(profile.emails[0].value);
          if (!user) {
            user = await UserRepository.createUser({
              first_name: profile.displayName || profile.username,
              last_name: "",
              email: profile.emails[0].value,
              password: "",
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "current",
    new passport.Strategy({}, async (req, done) => {
      try {
        const token = req.cookies.token;
        if (!token) {
          return done(null, false, { message: "No token found" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
          if (err) {
            return done(null, false, { message: "Invalid token" });
          }

          const user = await UserRepository.getUserById(decoded.userId);
          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          done(null, new UserDTO(user));
        });
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserRepository.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default initializePassport;
