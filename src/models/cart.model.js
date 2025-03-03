import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Referencia al producto
      quantity: { type: Number, required: true, min: 1 } // Cantidad del producto en el carrito
    }
  ],
  createdAt: { type: Date, default: Date.now }, // Fecha de creación
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
