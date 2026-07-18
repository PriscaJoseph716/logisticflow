import { requirePermission } from "../../middlewares/auth.middleware.js";
import type { DriverPermissionAction } from "./drivers.types.js";

export function requireDriversPermission(action: DriverPermissionAction) {
  return requirePermission(`drivers:${action}`);
}

export const requireDriversView = requireDriversPermission("view");
export const requireDriversCreate = requireDriversPermission("create");
export const requireDriversUpdate = requireDriversPermission("update");
export const requireDriversDelete = requireDriversPermission("delete");
