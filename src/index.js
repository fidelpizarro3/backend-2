import express from "express";
import { engine } from "express-handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import userRoutes from "./routes/session.routes.js";
import viewRoutes from "./routes/views.routes.js";
import dotenv from "dotenv";
import "dotenv/config";
import productRoutes from "./routes/products.router.js";
import ticketRoutes from "./routes/ticket.routes.js"; 

dotenv.config();

// PARTE 2
import initializePassport from "./config/passport.config.js";
import passport from "passport";

// settings
const app = express();
app.set("PORT", 3000);

//handlebars
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", "./src/views");

const secret = "miclave1234";
const mongodbUri = process.env.MONGODB_URI;

// connect database
const connectDb = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("Conexion exitosa");
  } catch (error) {
    console.log("Conexion NO exitosa", error);
  }
};

connectDb(mongodbUri);

// middlewares
app.use(express.json());
app.use("/api/tickets", ticketRoutes); // Rutas para el manejo de tickets
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: mongodbUri,
      ttl: 100,
    }),
    secret,
    resave: false,
    saveUninitialized: false,
  })
);

// PARTE 2
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// routes
app.get("/", (req, res) => {
  res.render("home", { title: "HOME" });
});
app.use("/api/products", productRoutes);
app.use("/api/sessions", userRoutes);
app.use("/", viewRoutes);

// listeners
app.listen(app.get("PORT"), () => {
  console.log(`Server on port ${app.get("PORT")}`);
});
