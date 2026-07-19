import { Router } from "express";
import { assignmentsController } from "../controllers/assignments.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const assignmentsRoutes = Router();

assignmentsRoutes.use(authMiddleware);
assignmentsRoutes.get("/", assignmentsController.list);
assignmentsRoutes.post("/", assignmentsController.create);
assignmentsRoutes.patch("/:id/status", assignmentsController.updateStatus);
assignmentsRoutes.post("/:id/proof", assignmentsController.uploadProof);

export { assignmentsRoutes };
