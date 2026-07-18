import { requirePermission } from "../../middlewares/auth.middleware.js";

export const requireShipmentsViewPermission = requirePermission("shipments:view");
export const requireShipmentsCreatePermission = requirePermission("shipments:create");
export const requireShipmentsEditPermission = requirePermission("shipments:edit");
export const requireShipmentsDeletePermission = requirePermission("shipments:delete");
