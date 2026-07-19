import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { healthController } from "../controllers/health.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { assignmentsRoutes } from "./assignments.routes.js";
import { authRoutes } from "./auth.routes.js";
import { rolesRoutes } from "./roles.routes.js";
import { usersRoutes } from "./users.routes.js";

const router = Router();

router.get("/", healthController.root);
router.get("/health", healthController.health);

router.use("/api/auth", authRoutes);
router.get("/api/me", authMiddleware, authController.me);
router.use("/api/users", usersRoutes);
router.use("/api/roles", rolesRoutes);
router.use("/api/assignments", assignmentsRoutes);

export { router };
