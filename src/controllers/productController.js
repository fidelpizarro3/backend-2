import Product from "../models/product.model.js"; // Asegúrate de importar el modelo de productos

export default {
  async getAllProducts(req, res) {
    try {
      const products = await Product.find().lean(); // Convierte los productos a objetos planos
      return products;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  },

  create: (req, res) => {
    res.send("Producto creado");
  },

  update: (req, res) => {
    res.send("Producto actualizado");
  },

  delete: (req, res) => {
    res.send("Producto eliminado");
  }
};
