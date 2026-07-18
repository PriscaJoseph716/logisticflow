import { requirePermission } from "../../middlewares/auth.middleware.js";

export const requireMaintenanceViewPermission = requirePermission("maintenance:view");
export const requireMaintenanceCreatePermission = requirePermission("maintenance:create");
export const requireMaintenanceEditPermission = requirePermission("maintenance:edit");
export const requireMaintenanceDeletePermission = requirePermission("maintenance:delete");
export const requireMaintenanceApprovePermission = requirePermission("maintenance:approve");
export const requireMaintenanceExportPermission = requirePermission("maintenance:export");
