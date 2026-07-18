import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { maintenanceController } from "./maintenance.controller.js";
import {
  requireMaintenanceCreatePermission,
  requireMaintenanceDeletePermission,
  requireMaintenanceEditPermission,
  requireMaintenanceViewPermission,
} from "./maintenance.middleware.js";
import {
  createMaintenanceSchema,
  deleteMaintenanceSchema,
  getMaintenanceSchema,
  maintenanceAnalyticsSchema,
  maintenanceReminderSchema,
  listMaintenanceSchema,
  updateMaintenanceSchema,
} from "./maintenance.validation.js";

export const maintenanceRouter = Router();

maintenanceRouter.use(requireAuth);
maintenanceRouter.use(createRequestAuditMiddleware("maintenance"));
maintenanceRouter.get(
  "/analytics",
  requireMaintenanceViewPermission,
  validate(maintenanceAnalyticsSchema),
  asyncHandler(maintenanceController.analytics),
);
maintenanceRouter.get(
  "/upcoming-service",
  requireMaintenanceViewPermission,
  validate(maintenanceReminderSchema),
  asyncHandler(maintenanceController.upcomingService),
);
maintenanceRouter.get(
  "/mileage-reminders",
  requireMaintenanceViewPermission,
  validate(maintenanceReminderSchema),
  asyncHandler(maintenanceController.mileageReminders),
);
maintenanceRouter.get("/", requireMaintenanceViewPermission, validate(listMaintenanceSchema), asyncHandler(maintenanceController.list));
maintenanceRouter.get("/:id", requireMaintenanceViewPermission, validate(getMaintenanceSchema), asyncHandler(maintenanceController.getById));
maintenanceRouter.post("/", requireMaintenanceCreatePermission, validate(createMaintenanceSchema), asyncHandler(maintenanceController.create));
maintenanceRouter.patch("/:id", requireMaintenanceEditPermission, validate(updateMaintenanceSchema), asyncHandler(maintenanceController.update));
maintenanceRouter.delete(
  "/:id",
  requireMaintenanceDeletePermission,
  validate(deleteMaintenanceSchema),
  asyncHandler(maintenanceController.remove),
);
