import Ticket from "../models/tickets.model.js"; // Importamos el modelo de Ticket

const ticketController = {
  // Crear un ticket cuando se finaliza la compra
  async createTicket(req, res) {
    try {
      // Suponiendo que el carrito y el total de la compra están en el body de la solicitud
      const { amount, purchaser } = req.body;

      // Crear el nuevo ticket
      const newTicket = new Ticket({
        amount,
        purchaser,
      });

      // Guardamos el ticket en la base de datos
      await newTicket.save();

      // Respondemos con el ticket creado
      res.status(201).json({
        message: "Ticket creado con éxito",
        ticket: newTicket,
      });
    } catch (error) {
      console.error("Error al crear ticket:", error);
      res.status(500).json({ message: "Error al crear el ticket" });
    }
  },
};

export default ticketController;
