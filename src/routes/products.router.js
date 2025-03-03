import { Router } from "express";
import productController from "../controllers/productController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

// Ruta para ver productos
router.get("/", async (req, res) => {
  try {
    let products = await productController.getAllProducts(); // Obtener productos

    // Convertir productos a JSON para evitar el error de Handlebars
    products = JSON.parse(JSON.stringify(products));

    const user = req.user || null;
    res.render(user?.role === "admin" ? "admin" : "user", { products, user });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error al obtener los productos");
  }
});

// Rutas protegidas por rol admin
router.post("/", isAdmin, productController.create);
router.put("/:id", isAdmin, productController.update);
router.delete("/:id", isAdmin, productController.delete);

export default router;
