import { requirePermission } from "../../middlewares/auth.middleware.js";

export const requirePaymentsViewPermission = requirePermission("payments:view");
export const requirePaymentsCreatePermission = requirePermission("payments:create");
export const requirePaymentsEditPermission = requirePermission("payments:edit");
export const requirePaymentsDeletePermission = requirePermission("payments:delete");
