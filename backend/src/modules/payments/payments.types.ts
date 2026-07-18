import type { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

export type SortOrder = "asc" | "desc";
export type PaymentSortField = "createdAt" | "paymentDate" | "amount" | "status" | "method";

export interface PaymentRouteParams {
  id: string;
}

export interface PaymentListQuery {
  search?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  customerId?: string;
  invoiceId?: string;
  paymentDateFrom?: Date;
  paymentDateTo?: Date;
  sortBy: PaymentSortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface PaymentCreateInput {
  invoiceId?: string;
  customerId?: string;
  amount: number;
  paymentDate: Date;
  method: PaymentMethod;
  reference?: string;
  status?: PaymentStatus;
  notes?: string;
}

export interface PaymentUpdateInput extends Partial<PaymentCreateInput> {}

export const paymentInclude = {
  invoice: true,
  customer: true,
} satisfies Prisma.PaymentInclude;

export type PaymentRecord = Prisma.PaymentGetPayload<{
  include: typeof paymentInclude;
}>;

export interface PaymentListResult {
  items: PaymentRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
