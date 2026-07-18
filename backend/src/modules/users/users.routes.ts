import { Router } from "express";
import { requireAuth, requirePermission } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { usersController } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.get("/me", asyncHandler(usersController.me));
usersRouter.get("/", requirePermission("users:view"), asyncHandler(usersController.list));
