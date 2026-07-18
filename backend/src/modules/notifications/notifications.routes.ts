import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { notificationsController } from "./notifications.controller.js";
import {
  requireNotificationsCreate,
  requireNotificationsDelete,
  requireNotificationsUpdate,
  requireNotificationsView,
} from "./notifications.middleware.js";
import {
  createNotificationsSchema,
  listNotificationsSchema,
  notificationsParamsSchema,
  updateNotificationsSchema,
} from "./notifications.validation.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth, createRequestAuditMiddleware("notifications"));
notificationsRouter.get("/", requireNotificationsView, validate(listNotificationsSchema), asyncHandler(notificationsController.list));
notificationsRouter.get("/:id", requireNotificationsView, validate(notificationsParamsSchema), asyncHandler(notificationsController.getById));
notificationsRouter.post("/", requireNotificationsCreate, validate(createNotificationsSchema), asyncHandler(notificationsController.create));
notificationsRouter.patch("/:id", requireNotificationsUpdate, validate(updateNotificationsSchema), asyncHandler(notificationsController.update));
notificationsRouter.delete("/:id", requireNotificationsDelete, validate(notificationsParamsSchema), asyncHandler(notificationsController.remove));
