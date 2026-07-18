import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { suppliersController } from "./suppliers.controller.js";
import {
  requireSuppliersCreate,
  requireSuppliersDelete,
  requireSuppliersUpdate,
  requireSuppliersView,
} from "./suppliers.middleware.js";
import {
  createSuppliersSchema,
  listSuppliersSchema,
  suppliersParamsSchema,
  updateSuppliersSchema,
} from "./suppliers.validation.js";

export const suppliersRouter = Router();

suppliersRouter.use(requireAuth, createRequestAuditMiddleware("suppliers"));
suppliersRouter.get("/", requireSuppliersView, validate(listSuppliersSchema), asyncHandler(suppliersController.list));
suppliersRouter.get("/:id", requireSuppliersView, validate(suppliersParamsSchema), asyncHandler(suppliersController.getById));
suppliersRouter.post("/", requireSuppliersCreate, validate(createSuppliersSchema), asyncHandler(suppliersController.create));
suppliersRouter.patch("/:id", requireSuppliersUpdate, validate(updateSuppliersSchema), asyncHandler(suppliersController.update));
suppliersRouter.delete("/:id", requireSuppliersDelete, validate(suppliersParamsSchema), asyncHandler(suppliersController.remove));
