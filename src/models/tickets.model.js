import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";  

const ticketSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      default: () => uuidv4(), // Genera el código único al crear el ticket
    },
    purchase_datetime: {
      type: Date,
      default: Date.now, // Guarda la fecha y hora actual
    },
    amount: {
      type: Number,
      required: true,
    },
    purchaser: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
