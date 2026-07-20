import { Router } from "express";
import { customersController } from "../controllers/customers.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const customersRoutes = Router();

customersRoutes.use(authMiddleware);
customersRoutes.get("/", customersController.list);
customersRoutes.post("/", customersController.create);
customersRoutes.patch("/:id", customersController.update);
customersRoutes.delete("/:id", customersController.remove);

export { customersRoutes };
