import { requirePermission } from "../../middlewares/auth.middleware.js";
import type { FleetPermissionAction } from "./fleet.types.js";

export function requireFleetPermission(action: FleetPermissionAction) {
  return requirePermission(`fleet:${action}`);
}

export const requireFleetView = requireFleetPermission("view");
export const requireFleetCreate = requireFleetPermission("create");
export const requireFleetUpdate = requireFleetPermission("update");
export const requireFleetDelete = requireFleetPermission("delete");
