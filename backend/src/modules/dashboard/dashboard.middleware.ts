import { requirePermission } from "../../middlewares/auth.middleware.js";
import type { DashboardPermissionAction } from "./dashboard.types.js";

export function requireDashboardPermission(action: DashboardPermissionAction) {
  return requirePermission(`dashboard:${action}`);
}

export const requireDashboardView = requireDashboardPermission("view");
export const requireDashboardCreate = requireDashboardPermission("create");
export const requireDashboardUpdate = requireDashboardPermission("update");
export const requireDashboardDelete = requireDashboardPermission("delete");
