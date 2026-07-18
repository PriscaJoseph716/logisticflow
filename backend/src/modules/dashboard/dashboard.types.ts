import { DashboardWidgetStatus, DashboardWidgetType } from "@prisma/client";

export { DashboardWidgetStatus, DashboardWidgetType };
export type DashboardWidgetLifecycleStatus = DashboardWidgetStatus;
export type DashboardWidgetKind = DashboardWidgetType;

export const DASHBOARD_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
  "widgetType",
  "status",
  "position",
] as const;
export type DashboardSortField = (typeof DASHBOARD_SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export interface DashboardSummaryTrendPoint {
  date: string;
  amount: number;
}

export interface DashboardSummary {
  todayRevenue: number;
  todayDeliveries: number;
  vehicles: number;
  drivers: number;
  customers: number;
  maintenanceDue: number;
  outstandingPayments: number;
  revenueTrend: DashboardSummaryTrendPoint[];
}

export interface DashboardWidgetRecord {
  id: string;
  businessId: string;
  title: string;
  widgetType: DashboardWidgetKind;
  status: DashboardWidgetLifecycleStatus;
  position: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDashboardWidgetInput {
  title: string;
  widgetType: DashboardWidgetKind;
  status?: DashboardWidgetLifecycleStatus;
  position?: number;
  description?: string | null;
}

export interface UpdateDashboardWidgetInput extends Partial<CreateDashboardWidgetInput> {}

export interface DashboardWidgetsListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: DashboardSortField;
  sortOrder: SortOrder;
  status?: DashboardWidgetLifecycleStatus;
  widgetType?: DashboardWidgetKind;
}

export interface DashboardWidgetsListResult {
  items: DashboardWidgetRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardWidgetRouteParams {
  id: string;
}

export type DashboardPermissionAction = "view" | "create" | "update" | "delete";
