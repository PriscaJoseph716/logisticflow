import { Router } from "express";
import { portalController } from "../controllers/portal.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { portalAuthMiddleware } from "../middlewares/portal-auth.middleware.js";

const portalRoutes = Router();

// Public: resolve business for branded login page
portalRoutes.get("/business/:businessId", portalController.business);
portalRoutes.post("/auth/login/:businessId", portalController.login);
portalRoutes.post("/auth/logout", portalController.logout);

// Customer-authenticated
portalRoutes.get("/me", portalAuthMiddleware, portalController.me);
portalRoutes.post("/auth/change-password", portalAuthMiddleware, portalController.changePassword);
portalRoutes.get("/dashboard", portalAuthMiddleware, portalController.dashboard);
portalRoutes.get("/orders", portalAuthMiddleware, portalController.orders);
portalRoutes.post("/orders", portalAuthMiddleware, portalController.createOrder);
portalRoutes.get("/invoices", portalAuthMiddleware, portalController.invoices);
portalRoutes.get("/invoices/:id", portalAuthMiddleware, portalController.invoice);
portalRoutes.get("/payments", portalAuthMiddleware, portalController.payments);
portalRoutes.get("/statement", portalAuthMiddleware, portalController.statement);
portalRoutes.get("/tracking", portalAuthMiddleware, portalController.tracking);
portalRoutes.get("/notifications", portalAuthMiddleware, portalController.notifications);
portalRoutes.patch("/notifications/:id/read", portalAuthMiddleware, portalController.readNotification);
portalRoutes.patch("/profile", portalAuthMiddleware, portalController.updateProfile);

// Admin: customer order requests
portalRoutes.get("/admin/order-requests", authMiddleware, portalController.adminOrders);
portalRoutes.patch("/admin/order-requests/:id", authMiddleware, portalController.adminUpdateOrder);

export { portalRoutes };
