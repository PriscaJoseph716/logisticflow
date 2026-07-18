import { requirePermission } from "../../middlewares/auth.middleware.js";
import type { SupplierPermissionAction } from "./suppliers.types.js";

export function requireSuppliersPermission(action: SupplierPermissionAction) {
  return requirePermission(`suppliers:${action}`);
}

export const requireSuppliersView = requireSuppliersPermission("view");
export const requireSuppliersCreate = requireSuppliersPermission("create");
export const requireSuppliersUpdate = requireSuppliersPermission("update");
export const requireSuppliersDelete = requireSuppliersPermission("delete");
