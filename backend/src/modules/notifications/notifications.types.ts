import type { Prisma } from "@prisma/client";
import { NotificationStatus, NotificationType } from "@prisma/client";

export { NotificationStatus, NotificationType };
export type NotificationLifecycleStatus = NotificationStatus;
export type NotificationKind = NotificationType;

export const NOTIFICATION_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
  "type",
  "status",
  "dueDate",
] as const;
export type NotificationSortField = (typeof NOTIFICATION_SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export interface NotificationRecord {
  id: string;
  businessId: string;
  type: NotificationKind;
  title: string;
  message: string;
  status: NotificationLifecycleStatus;
  relatedEntity: string | null;
  relatedEntityId: string | null;
  dueDate: Date | null;
  metadataJson: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCreateInput {
  type: NotificationKind;
  title: string;
  message: string;
  status?: NotificationLifecycleStatus;
  relatedEntity?: string | null;
  relatedEntityId?: string | null;
  dueDate?: Date | null;
  metadataJson?: Prisma.JsonValue | null;
}

export interface NotificationUpdateInput extends Partial<NotificationCreateInput> {}

export interface NotificationListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: NotificationSortField;
  sortOrder: SortOrder;
  type?: NotificationKind;
  status?: NotificationLifecycleStatus;
  relatedEntity?: string;
  dueBefore?: Date;
}

export interface NotificationListResult {
  items: NotificationRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationRouteParams {
  id: string;
}

export type NotificationPermissionAction = "view" | "create" | "update" | "delete";
