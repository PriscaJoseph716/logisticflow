import type { Prisma, ReportFormat, ReportStatus } from "@prisma/client";

export type SortOrder = "asc" | "desc";
export type ReportSortField = "createdAt" | "updatedAt" | "generatedAt" | "name" | "module" | "status";
export type ReportModule = "shipments" | "deliveries" | "maintenance" | "billing" | "payments" | "reports";
export type ReportExportFormat = Lowercase<`${ReportFormat}`>;

export interface ReportRouteParams {
  id: string;
}

export interface ReportListQuery {
  search?: string;
  module?: ReportModule;
  format?: ReportFormat;
  status?: ReportStatus;
  createdFrom?: Date;
  createdTo?: Date;
  sortBy: ReportSortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface ReportCreateInput {
  name: string;
  module: ReportModule;
  format: ReportFormat;
  status?: ReportStatus;
  filters?: Prisma.InputJsonValue;
  fileUrl?: string;
  generatedAt?: Date;
}

export interface ReportUpdateInput extends Partial<ReportCreateInput> {}

export interface ReportExportInput {
  name: string;
  module: ReportModule;
  format: ReportExportFormat;
  filters?: Record<string, unknown>;
  columns?: string[];
}

export const reportInclude = {} satisfies Prisma.ReportInclude;

export type ReportRecord = Prisma.ReportGetPayload<{
  include: typeof reportInclude;
}>;

export interface ReportListResult {
  items: ReportRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ReportExportFile {
  report: ReportRecord;
  fileName: string;
  mimeType: string;
  content: Buffer;
  generatedAt: Date;
}
