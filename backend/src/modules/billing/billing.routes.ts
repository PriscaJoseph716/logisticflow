import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { billingController } from "./billing.controller.js";
import {
  requireBillingCreatePermission,
  requireBillingDeletePermission,
  requireBillingEditPermission,
  requireBillingViewPermission,
} from "./billing.middleware.js";
import {
  billingSummarySchema,
  createBillingSchema,
  deleteBillingSchema,
  getBillingSchema,
  listBillingSchema,
  updateBillingSchema,
} from "./billing.validation.js";

export const billingRouter = Router();

billingRouter.use(requireAuth);
billingRouter.use(createRequestAuditMiddleware("billing"));
billingRouter.get("/summary", requireBillingViewPermission, validate(billingSummarySchema), asyncHandler(billingController.summary));
billingRouter.get("/", requireBillingViewPermission, validate(listBillingSchema), asyncHandler(billingController.list));
billingRouter.get("/:id", requireBillingViewPermission, validate(getBillingSchema), asyncHandler(billingController.getById));
billingRouter.post("/", requireBillingCreatePermission, validate(createBillingSchema), asyncHandler(billingController.create));
billingRouter.patch("/:id", requireBillingEditPermission, validate(updateBillingSchema), asyncHandler(billingController.update));
billingRouter.delete(
  "/:id",
  requireBillingDeletePermission,
  validate(deleteBillingSchema),
  asyncHandler(billingController.remove),
);
