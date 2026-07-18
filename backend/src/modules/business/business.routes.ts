import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { businessController } from "./business.controller.js";

export const businessRouter = Router();

businessRouter.use(requireAuth);
businessRouter.get("/me", asyncHandler(businessController.me));
