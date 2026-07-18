import { requirePermission } from "../../middlewares/auth.middleware.js";
import type { NotificationPermissionAction } from "./notifications.types.js";

export function requireNotificationsPermission(action: NotificationPermissionAction) {
  return requirePermission(`notifications:${action}`);
}

export const requireNotificationsView = requireNotificationsPermission("view");
export const requireNotificationsCreate = requireNotificationsPermission("create");
export const requireNotificationsUpdate = requireNotificationsPermission("update");
export const requireNotificationsDelete = requireNotificationsPermission("delete");
