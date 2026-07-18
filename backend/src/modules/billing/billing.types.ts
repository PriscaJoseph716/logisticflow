import type { InvoiceStatus, Prisma } from "@prisma/client";

export type SortOrder = "asc" | "desc";
export type BillingSortField =
  | "createdAt"
  | "issueDate"
  | "dueDate"
  | "invoiceNumber"
  | "totalAmount"
  | "balanceAmount"
  | "status";

export interface BillingRouteParams {
  id: string;
}

export interface BillingListQuery {
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  shipmentId?: string;
  issueDateFrom?: Date;
  issueDateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  outstandingOnly?: boolean;
  sortBy: BillingSortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface BillingCreateInput {
  invoiceNumber: string;
  customerId?: string;
  shipmentId?: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  status?: InvoiceStatus;
  notes?: string;
}

export interface BillingUpdateInput extends Partial<BillingCreateInput> {}

export interface BillingSummaryQuery {
  customerId?: string;
  from?: Date;
  to?: Date;
}

export const billingInclude = {
  customer: true,
  shipment: true,
  payments: true,
} satisfies Prisma.InvoiceInclude;

export type BillingRecord = Prisma.InvoiceGetPayload<{
  include: typeof billingInclude;
}>;

export interface BillingListResult {
  items: BillingRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BillingSummaryResult {
  totals: {
    invoices: number;
    totalRevenue: number;
    paidRevenue: number;
    outstandingBalance: number;
    overdueBalance: number;
  };
  statusBreakdown: Array<{
    status: InvoiceStatus;
    count: number;
    amount: number;
  }>;
}
