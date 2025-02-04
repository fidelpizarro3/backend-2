import passport from "passport";
import local from "passport-local";
import userModel from "../models/users.model.js";
import { createHash, isValidPassword } from "../utils.js";
import { Strategy as GitHubStrategy } from "passport-github2";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email } = req.body;
        try {
          const userFound = await userModel.findOne({ email: username });
          if (userFound) {
            console.log("Usuario ya existe");
            return done(null, false);
          }
          const newUser = {
            first_name,
            last_name,
            email,
            password: createHash(password),
          };
          const user = await userModel.create(newUser);

          return done(null, user);
        } catch (error) {
          return done(`error al crear el usuario ${error}`, false);
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
          const userExist = await userModel.findOne({ email: username });
          if (!userExist) return done(null, false);
          const isValid = isValidPassword(password, userExist.password);
          if (!isValid) {
            return done(null, false);
          } else {
            req.session.user = {
              first_name: userExist.first_name,
              last_name: userExist.last_name,
              email: userExist.email,
            };
            console.log(req.session.user);

            return done(null, userExist);
          }
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
          const userFound = await userModel.findOne({ email: profile.emails[0].value });

          if (userFound) {
            return done(null, userFound);
          }

          // Si el usuario no existe, lo creamos
          const newUser = {
            first_name: profile.displayName || profile.username,
            last_name: "",
            email: profile.emails[0].value,
            password: "", // No usamos contraseña porque es OAuth
          };

          const user = await userModel.create(newUser);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialización del usuario en la sesión
  passport.serializeUser((user, done) => {
    done(null, user._id); // Solo guardamos el _id del usuario
  });

  // Deserialización del usuario desde la sesión
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id); // Buscamos al usuario por su _id
      done(null, user); // Le pasamos el usuario completo a la sesión
    } catch (error) {
      done(error, null);
    }
  });
};

export default initializePassport;
