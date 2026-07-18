import { requirePermission } from "../../middlewares/auth.middleware.js";
import type { CustomerPermissionAction } from "./customers.types.js";

export function requireCustomersPermission(action: CustomerPermissionAction) {
  return requirePermission(`customers:${action}`);
}

export const requireCustomersView = requireCustomersPermission("view");
export const requireCustomersCreate = requireCustomersPermission("create");
export const requireCustomersUpdate = requireCustomersPermission("update");
export const requireCustomersDelete = requireCustomersPermission("delete");
