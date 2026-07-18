import { z } from "zod";
import {
  NOTIFICATION_SORT_FIELDS,
  NotificationStatus,
  NotificationType,
} from "./notifications.types.js";

export const listNotificationsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(NOTIFICATION_SORT_FIELDS).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    type: z.nativeEnum(NotificationType).optional(),
    status: z.nativeEnum(NotificationStatus).optional(),
    relatedEntity: z.string().trim().min(1).optional(),
    dueBefore: z.coerce.date().optional(),
  }),
  params: z.object({}).passthrough(),
});

export const notificationsParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});

export const createNotificationsSchema = z.object({
  body: z.object({
    type: z.nativeEnum(NotificationType),
    title: z.string().trim().min(2),
    message: z.string().trim().min(2),
    status: z.nativeEnum(NotificationStatus).optional(),
    relatedEntity: z.string().trim().min(2).nullable().optional(),
    relatedEntityId: z.string().trim().min(1).nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    metadataJson: z.unknown().nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateNotificationsSchema = z.object({
  body: z.object({
    type: z.nativeEnum(NotificationType).optional(),
    title: z.string().trim().min(2).optional(),
    message: z.string().trim().min(2).optional(),
    status: z.nativeEnum(NotificationStatus).optional(),
    relatedEntity: z.string().trim().min(2).nullable().optional(),
    relatedEntityId: z.string().trim().min(1).nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    metadataJson: z.unknown().nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});
