import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { driversController } from "./drivers.controller.js";
import {
  requireDriversCreate,
  requireDriversDelete,
  requireDriversUpdate,
  requireDriversView,
} from "./drivers.middleware.js";
import {
  createDriversSchema,
  driversParamsSchema,
  listDriversSchema,
  updateDriversSchema,
} from "./drivers.validation.js";

export const driversRouter = Router();

driversRouter.use(requireAuth, createRequestAuditMiddleware("drivers"));
driversRouter.get("/", requireDriversView, validate(listDriversSchema), asyncHandler(driversController.list));
driversRouter.get("/:id", requireDriversView, validate(driversParamsSchema), asyncHandler(driversController.getById));
driversRouter.post("/", requireDriversCreate, validate(createDriversSchema), asyncHandler(driversController.create));
driversRouter.patch("/:id", requireDriversUpdate, validate(updateDriversSchema), asyncHandler(driversController.update));
driversRouter.delete("/:id", requireDriversDelete, validate(driversParamsSchema), asyncHandler(driversController.remove));
