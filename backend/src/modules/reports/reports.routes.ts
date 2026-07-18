import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { reportsController } from "./reports.controller.js";
import {
  requireReportsCreatePermission,
  requireReportsDeletePermission,
  requireReportsEditPermission,
  requireReportsExportPermission,
  requireReportsViewPermission,
} from "./reports.middleware.js";
import {
  createReportSchema,
  deleteReportSchema,
  exportReportsSchema,
  getReportSchema,
  listReportsSchema,
  updateReportSchema,
} from "./reports.validation.js";

export const reportsRouter = Router();

reportsRouter.use(requireAuth);
reportsRouter.use(createRequestAuditMiddleware("reports"));
reportsRouter.get("/", requireReportsViewPermission, validate(listReportsSchema), asyncHandler(reportsController.list));
reportsRouter.get("/:id", requireReportsViewPermission, validate(getReportSchema), asyncHandler(reportsController.getById));
reportsRouter.post("/", requireReportsCreatePermission, validate(createReportSchema), asyncHandler(reportsController.create));
reportsRouter.post("/exports", requireReportsExportPermission, validate(exportReportsSchema), asyncHandler(reportsController.export));
reportsRouter.patch("/:id", requireReportsEditPermission, validate(updateReportSchema), asyncHandler(reportsController.update));
reportsRouter.delete("/:id", requireReportsDeletePermission, validate(deleteReportSchema), asyncHandler(reportsController.remove));
