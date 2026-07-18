import { requirePermission } from "../../middlewares/auth.middleware.js";

export const requireDeliveriesViewPermission = requirePermission("deliveries:view");
export const requireDeliveriesCreatePermission = requirePermission("deliveries:create");
export const requireDeliveriesEditPermission = requirePermission("deliveries:edit");
export const requireDeliveriesDeletePermission = requirePermission("deliveries:delete");
