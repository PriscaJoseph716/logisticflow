import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { deliveriesController } from "./deliveries.controller.js";
import {
  requireDeliveriesCreatePermission,
  requireDeliveriesDeletePermission,
  requireDeliveriesEditPermission,
  requireDeliveriesViewPermission,
} from "./deliveries.middleware.js";
import {
  createDeliverySchema,
  deleteDeliverySchema,
  getDeliverySchema,
  listDeliveriesSchema,
  updateDeliverySchema,
} from "./deliveries.validation.js";

export const deliveriesRouter = Router();

deliveriesRouter.use(requireAuth);
deliveriesRouter.use(createRequestAuditMiddleware("deliveries"));
deliveriesRouter.get("/", requireDeliveriesViewPermission, validate(listDeliveriesSchema), asyncHandler(deliveriesController.list));
deliveriesRouter.get("/:id", requireDeliveriesViewPermission, validate(getDeliverySchema), asyncHandler(deliveriesController.getById));
deliveriesRouter.post("/", requireDeliveriesCreatePermission, validate(createDeliverySchema), asyncHandler(deliveriesController.create));
deliveriesRouter.patch("/:id", requireDeliveriesEditPermission, validate(updateDeliverySchema), asyncHandler(deliveriesController.update));
deliveriesRouter.delete(
  "/:id",
  requireDeliveriesDeletePermission,
  validate(deleteDeliverySchema),
  asyncHandler(deliveriesController.remove),
);
