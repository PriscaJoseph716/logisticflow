import { requirePermission } from "../../middlewares/auth.middleware.js";

export const requireReportsViewPermission = requirePermission("reports:view");
export const requireReportsCreatePermission = requirePermission("reports:create");
export const requireReportsEditPermission = requirePermission("reports:edit");
export const requireReportsDeletePermission = requirePermission("reports:delete");
export const requireReportsExportPermission = requirePermission("reports:export");
