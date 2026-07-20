import { Router } from "express";
import { deliveriesController } from "../controllers/deliveries.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const deliveriesRoutes = Router();

deliveriesRoutes.use(authMiddleware);
deliveriesRoutes.get("/", deliveriesController.list);

export { deliveriesRoutes };
