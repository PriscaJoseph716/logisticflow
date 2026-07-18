import type { MaintenanceStatus, Prisma } from "@prisma/client";

export type SortOrder = "asc" | "desc";
export type MaintenanceSortField =
  | "maintenanceDate"
  | "nextServiceDate"
  | "nextServiceMileage"
  | "currentMileage"
  | "totalCost"
  | "createdAt"
  | "status";

export interface MaintenanceRouteParams {
  id: string;
}

export interface MaintenancePartInput {
  partName: string;
  brand?: string;
  quantity?: number;
  unitPrice?: number;
  supplier?: string;
}

export interface MaintenanceAttachmentInput {
  category: string;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
}

export interface MaintenanceListQuery {
  search?: string;
  status?: MaintenanceStatus;
  vehicleId?: string;
  maintenanceType?: string;
  overdueOnly?: boolean;
  upcomingOnly?: boolean;
  serviceFrom?: Date;
  serviceTo?: Date;
  dueWithinDays?: number;
  sortBy: MaintenanceSortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface MaintenanceCreateInput {
  vehicleId: string;
  maintenanceDate: Date;
  maintenanceType: string;
  workshop: string;
  mechanic: string;
  description?: string;
  currentMileage: number;
  laborCost?: number;
  otherCost?: number;
  nextServiceDate?: Date;
  nextServiceMileage?: number;
  status?: MaintenanceStatus;
  timeline?: Prisma.InputJsonValue;
  upcomingService?: Prisma.InputJsonValue;
  parts?: MaintenancePartInput[];
  attachments?: MaintenanceAttachmentInput[];
}

export interface MaintenanceUpdateInput extends Partial<MaintenanceCreateInput> {}

export interface MaintenanceAnalyticsQuery {
  vehicleId?: string;
  from?: Date;
  to?: Date;
}

export interface MaintenanceReminderQuery {
  vehicleId?: string;
  days?: number;
  mileageThreshold?: number;
}

export const maintenanceInclude = {
  vehicle: true,
  parts: true,
  attachments: true,
} satisfies Prisma.MaintenanceRecordInclude;

export type MaintenanceRecord = Prisma.MaintenanceRecordGetPayload<{
  include: typeof maintenanceInclude;
}>;

export interface MaintenanceListResult {
  items: MaintenanceRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface MaintenanceAnalyticsResult {
  totals: {
    records: number;
    totalCost: number;
    laborCost: number;
    partsCost: number;
    otherCost: number;
    averageCost: number;
  };
  statusBreakdown: Array<{
    status: MaintenanceStatus;
    count: number;
  }>;
  upcomingServiceCount: number;
  overdueCount: number;
  monthlySpend: Array<{
    month: string;
    totalCost: number;
  }>;
}
