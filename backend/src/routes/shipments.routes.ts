import { Router } from "express";
import { shipmentsController } from "../controllers/shipments.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const shipmentsRoutes = Router();

shipmentsRoutes.use(authMiddleware);
shipmentsRoutes.get("/", shipmentsController.list);
shipmentsRoutes.post("/", shipmentsController.create);
shipmentsRoutes.patch("/:id", shipmentsController.update);
shipmentsRoutes.delete("/:id", shipmentsController.remove);

export { shipmentsRoutes };
