import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { dashboardController } from "./dashboard.controller.js";
import {
  requireDashboardCreate,
  requireDashboardDelete,
  requireDashboardUpdate,
  requireDashboardView,
} from "./dashboard.middleware.js";
import {
  createDashboardWidgetSchema,
  dashboardSummarySchema,
  dashboardWidgetParamsSchema,
  listDashboardWidgetsSchema,
  updateDashboardWidgetSchema,
} from "./dashboard.validation.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth, createRequestAuditMiddleware("dashboard"));
dashboardRouter.get("/summary", requireDashboardView, validate(dashboardSummarySchema), asyncHandler(dashboardController.summary));
dashboardRouter.get("/widgets", requireDashboardView, validate(listDashboardWidgetsSchema), asyncHandler(dashboardController.listWidgets));
dashboardRouter.get("/widgets/:id", requireDashboardView, validate(dashboardWidgetParamsSchema), asyncHandler(dashboardController.getWidgetById));
dashboardRouter.post("/widgets", requireDashboardCreate, validate(createDashboardWidgetSchema), asyncHandler(dashboardController.createWidget));
dashboardRouter.patch("/widgets/:id", requireDashboardUpdate, validate(updateDashboardWidgetSchema), asyncHandler(dashboardController.updateWidget));
dashboardRouter.delete("/widgets/:id", requireDashboardDelete, validate(dashboardWidgetParamsSchema), asyncHandler(dashboardController.removeWidget));
