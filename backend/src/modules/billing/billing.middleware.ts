import { requirePermission } from "../../middlewares/auth.middleware.js";

export const requireBillingViewPermission = requirePermission("billing:view");
export const requireBillingCreatePermission = requirePermission("billing:create");
export const requireBillingEditPermission = requirePermission("billing:edit");
export const requireBillingDeletePermission = requirePermission("billing:delete");
