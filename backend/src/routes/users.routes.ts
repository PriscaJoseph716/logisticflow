import { Router } from "express";
import { usersController } from "../controllers/users.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireOwner } from "../middlewares/require-owner.middleware.js";

const usersRoutes = Router();

usersRoutes.use(authMiddleware);
usersRoutes.get("/", requireOwner, usersController.list);
usersRoutes.post("/", requireOwner, usersController.create);

export { usersRoutes };
