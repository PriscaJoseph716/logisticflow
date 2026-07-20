import { Router } from "express";
import { billingController } from "../controllers/billing.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const billingRoutes = Router();

billingRoutes.use(authMiddleware);
billingRoutes.get("/", billingController.list);
billingRoutes.get("/summary", billingController.summary);

export { billingRoutes };
