import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadsController } from "../controllers/uploads.controller.js";

export const uploadsRouter = Router();

uploadsRouter.use(requireAuth);
uploadsRouter.post("/", upload.array("files", 10), asyncHandler(uploadsController.uploadFiles));
