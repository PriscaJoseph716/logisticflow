import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { healthController } from "../controllers/health.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { assignmentsRoutes } from "./assignments.routes.js";
import { authRoutes } from "./auth.routes.js";
import { billingRoutes } from "./billing.routes.js";
import { customersRoutes } from "./customers.routes.js";
import { dashboardRoutes } from "./dashboard.routes.js";
import { deliveriesRoutes } from "./deliveries.routes.js";
import { fleetRoutes } from "./fleet.routes.js";
import { maintenanceRoutes } from "./maintenance.routes.js";
import { notificationsRoutes } from "./notifications.routes.js";
import { paymentsRoutes } from "./payments.routes.js";
import { portalRoutes } from "./portal.routes.js";
import { reportsRoutes } from "./reports.routes.js";
import { rolesRoutes } from "./roles.routes.js";
import { shipmentsRoutes } from "./shipments.routes.js";
import { suppliersRoutes } from "./suppliers.routes.js";
import { uploadsRoutes } from "./uploads.routes.js";
import { usersRoutes } from "./users.routes.js";

const router = Router();

router.get("/", healthController.root);
router.get("/health", healthController.health);

router.use("/api/auth", authRoutes);
router.get("/api/me", authMiddleware, authController.me);
router.use("/api/portal", portalRoutes);
router.use("/api/users", usersRoutes);
router.use("/api/roles", rolesRoutes);
router.use("/api/assignments", assignmentsRoutes);
router.use("/api/fleet", fleetRoutes);
router.use("/api/customers", customersRoutes);
router.use("/api/suppliers", suppliersRoutes);
router.use("/api/shipments", shipmentsRoutes);
router.use("/api/deliveries", deliveriesRoutes);
router.use("/api/maintenance", maintenanceRoutes);
router.use("/api/billing", billingRoutes);
router.use("/api/payments", paymentsRoutes);
router.use("/api/dashboard", dashboardRoutes);
router.use("/api/uploads", uploadsRoutes);
router.use("/api/notifications", notificationsRoutes);
router.use("/api/reports", reportsRoutes);

export { router };
