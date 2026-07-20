import { Router } from "express";
import { notificationsController } from "../controllers/notifications.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const notificationsRoutes = Router();

notificationsRoutes.use(authMiddleware);
notificationsRoutes.get("/", notificationsController.list);

export { notificationsRoutes };
