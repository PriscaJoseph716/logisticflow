import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { createRequestAuditMiddleware } from "../../middlewares/request-audit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { fleetController } from "./fleet.controller.js";
import {
  requireFleetCreate,
  requireFleetDelete,
  requireFleetUpdate,
  requireFleetView,
} from "./fleet.middleware.js";
import {
  createFleetSchema,
  fleetParamsSchema,
  listFleetSchema,
  updateFleetSchema,
} from "./fleet.validation.js";

export const fleetRouter = Router();

fleetRouter.use(requireAuth, createRequestAuditMiddleware("fleet"));
fleetRouter.get("/", requireFleetView, validate(listFleetSchema), asyncHandler(fleetController.list));
fleetRouter.get("/:id", requireFleetView, validate(fleetParamsSchema), asyncHandler(fleetController.getById));
fleetRouter.post("/", requireFleetCreate, validate(createFleetSchema), asyncHandler(fleetController.create));
fleetRouter.patch("/:id", requireFleetUpdate, validate(updateFleetSchema), asyncHandler(fleetController.update));
fleetRouter.delete("/:id", requireFleetDelete, validate(fleetParamsSchema), asyncHandler(fleetController.remove));
