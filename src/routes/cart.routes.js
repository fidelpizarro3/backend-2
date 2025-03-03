import { Router } from "express";
import Cart from "../models/cart.model.js"; // Importar modelo de carrito
import Product from "../models/product.model.js"; // Importar modelo de productos
import Ticket from "../models/tickets.model.js"; // Importar modelo de ticket

const router = Router();

// Ruta para finalizar la compra de un carrito
router.post("/:cid/purchase", async (req, res) => {
  const cartId = req.params.cid;
  try {
    // Obtener el carrito por ID
    const cart = await Cart.findById(cartId).populate("products.product"); // Poblamos los productos
    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    let totalAmount = 0; // Total de la compra
    let purchaseDetails = []; // Detalles de los productos comprados
    let insufficientStock = false; // Indicador de si falta stock

    // Verificar stock de los productos y calcular el total
    for (const item of cart.products) {
      const product = item.product;
      const quantity = item.quantity;

      // Verificar si hay suficiente stock
      if (product.stock < quantity) {
        insufficientStock = true;
        continue; // Si no hay stock suficiente, saltar al siguiente producto
      }

      // Restar la cantidad del stock
      product.stock -= quantity;
      await product.save(); // Guardar el producto con el stock actualizado

      // Calcular el total de la compra
      totalAmount += product.price * quantity;
      purchaseDetails.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    // Si falta stock en algún producto
    if (insufficientStock) {
      return res.status(400).send("Algunos productos no tienen suficiente stock.");
    }

    // Crear el ticket de compra
    const ticket = new Ticket({
      amount: totalAmount,
      purchaser: req.user.email, // Suponiendo que el correo del usuario está en req.user
    });

    // Guardar el ticket
    await ticket.save();

    // Limpiar el carrito (opcional)
    cart.products = [];
    await cart.save();

    return res.status(200).send({
      message: "Compra realizada con éxito",
      ticket,
      purchaseDetails,
    });
  } catch (error) {
    console.error("Error al procesar la compra:", error);
    return res.status(500).send("Error al procesar la compra");
  }
});

export default router;
