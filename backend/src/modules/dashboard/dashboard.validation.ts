import { z } from "zod";
import {
  DASHBOARD_SORT_FIELDS,
  DashboardWidgetStatus,
  DashboardWidgetType,
} from "./dashboard.types.js";

export const dashboardSummarySchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const listDashboardWidgetsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    sortBy: z.enum(DASHBOARD_SORT_FIELDS).default("position"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
    status: z.nativeEnum(DashboardWidgetStatus).optional(),
    widgetType: z.nativeEnum(DashboardWidgetType).optional(),
  }),
  params: z.object({}).passthrough(),
});

export const dashboardWidgetParamsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});

export const createDashboardWidgetSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2),
    widgetType: z.nativeEnum(DashboardWidgetType),
    status: z.nativeEnum(DashboardWidgetStatus).optional(),
    position: z.coerce.number().int().min(0).optional(),
    description: z.string().trim().min(2).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateDashboardWidgetSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).optional(),
    widgetType: z.nativeEnum(DashboardWidgetType).optional(),
    status: z.nativeEnum(DashboardWidgetStatus).optional(),
    position: z.coerce.number().int().min(0).optional(),
    description: z.string().trim().min(2).nullable().optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().trim().min(1) }),
});
