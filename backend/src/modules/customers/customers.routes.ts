import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { customersController } from "./customers.controller.js";
import {
  requireCustomersCreate,
  requireCustomersDelete,
  requireCustomersUpdate,
  requireCustomersView,
} from "./customers.middleware.js";
import {
  createCustomersSchema,
  customersParamsSchema,
  listCustomersSchema,
  updateCustomersSchema,
} from "./customers.validation.js";

export const customersRouter = Router();

customersRouter.use(requireAuth, createRequestAuditMiddleware("customers"));
customersRouter.get("/", requireCustomersView, validate(listCustomersSchema), asyncHandler(customersController.list));
customersRouter.get("/:id", requireCustomersView, validate(customersParamsSchema), asyncHandler(customersController.getById));
customersRouter.post("/", requireCustomersCreate, validate(createCustomersSchema), asyncHandler(customersController.create));
customersRouter.patch("/:id", requireCustomersUpdate, validate(updateCustomersSchema), asyncHandler(customersController.update));
customersRouter.delete("/:id", requireCustomersDelete, validate(customersParamsSchema), asyncHandler(customersController.remove));
