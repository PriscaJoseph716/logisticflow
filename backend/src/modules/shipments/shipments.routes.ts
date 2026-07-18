import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { shipmentsController } from "./shipments.controller.js";
import {
  requireShipmentsCreatePermission,
  requireShipmentsDeletePermission,
  requireShipmentsEditPermission,
  requireShipmentsViewPermission,
} from "./shipments.middleware.js";
import {
  createShipmentSchema,
  deleteShipmentSchema,
  getShipmentSchema,
  listShipmentsSchema,
  updateShipmentSchema,
} from "./shipments.validation.js";

export const shipmentsRouter = Router();

shipmentsRouter.use(requireAuth);
shipmentsRouter.use(createRequestAuditMiddleware("shipments"));
shipmentsRouter.get("/", requireShipmentsViewPermission, validate(listShipmentsSchema), asyncHandler(shipmentsController.list));
shipmentsRouter.get("/:id", requireShipmentsViewPermission, validate(getShipmentSchema), asyncHandler(shipmentsController.getById));
shipmentsRouter.post("/", requireShipmentsCreatePermission, validate(createShipmentSchema), asyncHandler(shipmentsController.create));
shipmentsRouter.patch("/:id", requireShipmentsEditPermission, validate(updateShipmentSchema), asyncHandler(shipmentsController.update));
shipmentsRouter.delete(
  "/:id",
  requireShipmentsDeletePermission,
  validate(deleteShipmentSchema),
  asyncHandler(shipmentsController.remove),
);
