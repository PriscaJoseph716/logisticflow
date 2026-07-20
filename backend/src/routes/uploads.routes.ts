import { Router } from "express";
import multer from "multer";
import { uploadsController } from "../controllers/uploads.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 20 },
});

const uploadsRoutes = Router();

uploadsRoutes.use(authMiddleware);
uploadsRoutes.post(
  "/",
  (request, response, next) => {
    if (request.is("multipart/form-data")) {
      upload.array("files")(request, response, next);
      return;
    }
    next();
  },
  uploadsController.create,
);

export { uploadsRoutes };
