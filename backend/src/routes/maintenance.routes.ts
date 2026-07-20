import { Router } from "express";
import { maintenanceController } from "../controllers/maintenance.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const maintenanceRoutes = Router();

maintenanceRoutes.use(authMiddleware);
maintenanceRoutes.get("/", maintenanceController.list);
maintenanceRoutes.get("/analytics", maintenanceController.analytics);
maintenanceRoutes.get("/upcoming-service", maintenanceController.upcomingService);
maintenanceRoutes.get("/mileage-reminders", maintenanceController.mileageReminders);
maintenanceRoutes.post("/", maintenanceController.create);
maintenanceRoutes.patch("/:id", maintenanceController.update);
maintenanceRoutes.delete("/:id", maintenanceController.remove);

export { maintenanceRoutes };
