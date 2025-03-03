import { Router } from "express";
import ticketController from "../controllers/ticketController.js"; // Importamos el controlador

const router = Router();

// Ruta para crear un ticket (finalización de la compra)
router.post("/", ticketController.createTicket);

export default router;
