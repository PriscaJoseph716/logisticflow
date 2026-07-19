import { Router } from "express";
import { rolesController } from "../controllers/roles.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireOwner } from "../middlewares/require-owner.middleware.js";

const rolesRoutes = Router();

rolesRoutes.use(authMiddleware);
rolesRoutes.get("/", requireOwner, rolesController.list);
rolesRoutes.post("/", requireOwner, rolesController.create);

export { rolesRoutes };
