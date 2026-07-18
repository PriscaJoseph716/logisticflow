import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { paymentsController } from "./payments.controller.js";
import {
  requirePaymentsCreatePermission,
  requirePaymentsDeletePermission,
  requirePaymentsEditPermission,
  requirePaymentsViewPermission,
} from "./payments.middleware.js";
import {
  createPaymentSchema,
  deletePaymentSchema,
  getPaymentSchema,
  listPaymentsSchema,
  updatePaymentSchema,
} from "./payments.validation.js";

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);
paymentsRouter.use(createRequestAuditMiddleware("payments"));
paymentsRouter.get("/", requirePaymentsViewPermission, validate(listPaymentsSchema), asyncHandler(paymentsController.list));
paymentsRouter.get("/:id", requirePaymentsViewPermission, validate(getPaymentSchema), asyncHandler(paymentsController.getById));
paymentsRouter.post("/", requirePaymentsCreatePermission, validate(createPaymentSchema), asyncHandler(paymentsController.create));
paymentsRouter.patch("/:id", requirePaymentsEditPermission, validate(updatePaymentSchema), asyncHandler(paymentsController.update));
paymentsRouter.delete(
  "/:id",
  requirePaymentsDeletePermission,
  validate(deletePaymentSchema),
  asyncHandler(paymentsController.remove),
);
