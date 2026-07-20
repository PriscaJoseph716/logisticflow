import { Router } from "express";
import { suppliersController } from "../controllers/suppliers.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const suppliersRoutes = Router();

suppliersRoutes.use(authMiddleware);
suppliersRoutes.get("/", suppliersController.list);
suppliersRoutes.post("/", suppliersController.create);
suppliersRoutes.patch("/:id", suppliersController.update);
suppliersRoutes.delete("/:id", suppliersController.remove);

export { suppliersRoutes };
