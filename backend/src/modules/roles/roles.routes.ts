import { Router } from "express";
import { requireAuth, requirePermission } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { rolesController } from "./roles.controller.js";

export const rolesRouter = Router();

rolesRouter.use(requireAuth, requirePermission("roles:view"));
rolesRouter.get("/", asyncHandler(rolesController.list));
