import { Router } from "express";
import { paymentsController } from "../controllers/payments.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const paymentsRoutes = Router();

paymentsRoutes.use(authMiddleware);
paymentsRoutes.get("/", paymentsController.list);
paymentsRoutes.post("/", paymentsController.create);
paymentsRoutes.patch("/:id", paymentsController.update);
paymentsRoutes.delete("/:id", paymentsController.remove);

export { paymentsRoutes };
