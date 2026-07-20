import { Router } from "express";
import { fleetController } from "../controllers/fleet.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const fleetRoutes = Router();

fleetRoutes.use(authMiddleware);
fleetRoutes.get("/", fleetController.list);
fleetRoutes.post("/", fleetController.create);
fleetRoutes.patch("/:id", fleetController.update);
fleetRoutes.delete("/:id", fleetController.remove);

export { fleetRoutes };
