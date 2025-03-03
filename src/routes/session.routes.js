import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import productController from "../controllers/productController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";
import UserDTO from "../dtos/user.dto.js";

const router = Router();

router.post("/", isAdmin, productController.create);
router.put("/:id", isAdmin, productController.update);
router.delete("/:id", isAdmin, productController.delete);

// Registro de usuario
router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "failregister" }),
  (req, res) => {
    res.redirect("/login");
  }
);

router.get("/failregister", (req, res) => {
  res.status(400).send({ status: "error", message: "Error al registrar el usuario" });
});

// Login de usuario con redirección según rol
router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "faillogin" }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
    });

    // Guardar usuario en la sesión
    req.session.user = {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    };

    // Redirigir según el rol
    if (user.role === "admin") {
      return res.redirect("/products");
    } else {
      return res.redirect("/products");
    }
  }
);

router.get("/faillogin", (req, res) => {
  res.status(400).send({ status: "error", message: "Error al ingresar" });
});

router.get("/current", passport.authenticate("current", { session: false }), (req, res) => {
  res.json(req.user);
});

// Logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie("token");
    res.redirect("/login");
  });
});

// Login con GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = new UserDTO(req.user);
    
    // Redirigir según el rol después de GitHub Login
    if (req.user.role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/products");
    }
  }
);

export default router;
