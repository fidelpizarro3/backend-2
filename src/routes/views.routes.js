import { Router } from "express";
import passport from "passport";
import Product from "../models/product.model.js"; // Asegurate de tener el modelo correcto
import { isAuthenticated, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/register", (req, res) => {
  res.render("register", { title: "REGISTER" });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "LOGIN" });
});

router.get("/profile", (req, res) => {
  const user = { ...req.user }; //passport
  console.log(user);
  res.render("profile", { title: "PROFILE", user: user._doc });
});

// 🔹 Rutas para productos según el rol
router.get("/admin/products", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const products = await Product.find(); // Obtiene los productos de MongoDB
    res.render("admin", { title: "ADMIN - Productos", products, user: req.user });
  } catch (error) {
    res.status(500).send("Error al cargar los productos.");
  }
});

router.get("/user/products", isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find(); // Obtiene los productos de MongoDB
    res.render("user", { title: "Productos", products, user: req.user });
  } catch (error) {
    res.status(500).send("Error al cargar los productos.");
  }
});

router.get("/products", (req, res) => {
  if (req.user) {
    if (req.user.role === "admin") {
      return res.redirect("/admin/products");
    } else if (req.user.role === "user") {
      return res.redirect("/user/products");
    }
  } else {
    return res.redirect("/guest/products");
  }
});

// Google Auth
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  })
);

// Recupero contraseña
router.get("/recupero", (req, res) => {
  res.render("recupero", { title: "Recuperar pass" });
});

export default router;
