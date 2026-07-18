import { Router } from "express";
import { requireAuth, requirePermission } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { permissionsController } from "./permissions.controller.js";

export const permissionsRouter = Router();

permissionsRouter.use(requireAuth, requirePermission("permissions:view"));
permissionsRouter.get("/", asyncHandler(permissionsController.list));
