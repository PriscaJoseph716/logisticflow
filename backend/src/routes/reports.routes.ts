import { Router } from "express";
import { reportsController } from "../controllers/reports.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const reportsRoutes = Router();

reportsRoutes.use(authMiddleware);
reportsRoutes.get("/", reportsController.list);
reportsRoutes.post("/exports", reportsController.export);

export { reportsRoutes };
