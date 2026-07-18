import { InvoiceStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";
import type {
  BillingCreateInput,
  BillingListQuery,
  BillingListResult,
  BillingRecord,
  BillingSortField,
  BillingSummaryQuery,
  BillingSummaryResult,
  SortOrder,
  BillingUpdateInput,
} from "./billing.types.js";
import { billingInclude } from "./billing.types.js";

function buildOrderBy(sortBy: BillingSortField, sortOrder: SortOrder): Prisma.InvoiceOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

function normalizeInvoiceAmounts(payload: BillingCreateInput | BillingUpdateInput, existing?: Prisma.InvoiceUncheckedCreateInput) {
  const subtotal = payload.subtotal ?? existing?.subtotal ?? 0;
  const taxAmount = payload.taxAmount ?? existing?.taxAmount ?? 0;
  const totalAmount = payload.totalAmount ?? subtotal + taxAmount;
  const paidAmount = payload.paidAmount ?? existing?.paidAmount ?? 0;
  const balanceAmount = Math.max(totalAmount - paidAmount, 0);

  return { subtotal, taxAmount, totalAmount, paidAmount, balanceAmount };
}

function deriveInvoiceStatus(
  dueDate: Date,
  paidAmount: number,
  totalAmount: number,
  explicitStatus?: InvoiceStatus,
) {
  if (explicitStatus) {
    return explicitStatus;
  }

  if (paidAmount >= totalAmount && totalAmount > 0) {
    return InvoiceStatus.PAID;
  }

  if (paidAmount > 0) {
    return InvoiceStatus.PARTIAL;
  }

  if (dueDate < new Date()) {
    return InvoiceStatus.OVERDUE;
  }

  return InvoiceStatus.DRAFT;
}

async function assertRelations(businessId: string, payload: BillingCreateInput | BillingUpdateInput) {
  const [customer, shipment] = await Promise.all([
    payload.customerId
      ? prisma.customer.findFirst({ where: { id: payload.customerId, businessId }, select: { id: true } })
      : null,
    payload.shipmentId
      ? prisma.shipment.findFirst({ where: { id: payload.shipmentId, businessId }, select: { id: true } })
      : null,
  ]);

  if (payload.customerId && !customer) {
    throw new AppError("Customer not found for this business.", 404, "CUSTOMER_NOT_FOUND");
  }

  if (payload.shipmentId && !shipment) {
    throw new AppError("Shipment not found for this business.", 404, "SHIPMENT_NOT_FOUND");
  }
}

function buildWhereClause(businessId: string, query: BillingListQuery): Prisma.InvoiceWhereInput {
  return {
    businessId,
    status: query.status,
    customerId: query.customerId,
    shipmentId: query.shipmentId,
    balanceAmount: query.outstandingOnly ? { gt: 0 } : undefined,
    issueDate: query.issueDateFrom || query.issueDateTo
      ? {
          gte: query.issueDateFrom,
          lte: query.issueDateTo,
        }
      : undefined,
    dueDate: query.dueDateFrom || query.dueDateTo
      ? {
          gte: query.dueDateFrom,
          lte: query.dueDateTo,
        }
      : undefined,
    OR: query.search
      ? [
          { invoiceNumber: { contains: query.search, mode: "insensitive" } },
          { notes: { contains: query.search, mode: "insensitive" } },
          { customer: { is: { name: { contains: query.search, mode: "insensitive" } } } },
          { shipment: { is: { shipmentCode: { contains: query.search, mode: "insensitive" } } } },
        ]
      : undefined,
  };
}

export class BillingRepository {
  async list(businessId: string, query: BillingListQuery): Promise<BillingListResult> {
    const where = buildWhereClause(businessId, query);
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: billingInclude,
        orderBy: buildOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: query.pageSize,
      }),
      prisma.invoice.count({ where }),
    ]);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
    };
  }

  async findById(businessId: string, billingId: string): Promise<BillingRecord | null> {
    return prisma.invoice.findFirst({
      where: {
        id: billingId,
        businessId,
      },
      include: billingInclude,
    });
  }

  async create(businessId: string, payload: BillingCreateInput): Promise<BillingRecord> {
    await assertRelations(businessId, payload);
    const amounts = normalizeInvoiceAmounts(payload);

    return prisma.invoice.create({
      data: {
        businessId,
        invoiceNumber: payload.invoiceNumber,
        customerId: payload.customerId,
        shipmentId: payload.shipmentId,
        issueDate: payload.issueDate,
        dueDate: payload.dueDate,
        subtotal: amounts.subtotal,
        taxAmount: amounts.taxAmount,
        totalAmount: amounts.totalAmount,
        paidAmount: amounts.paidAmount,
        balanceAmount: amounts.balanceAmount,
        status: deriveInvoiceStatus(payload.dueDate, amounts.paidAmount, amounts.totalAmount, payload.status),
        notes: payload.notes,
      },
      include: billingInclude,
    });
  }

  async update(businessId: string, billingId: string, payload: BillingUpdateInput): Promise<BillingRecord | null> {
    const existingRecord = await prisma.invoice.findFirst({
      where: {
        id: billingId,
        businessId,
      },
    });

    if (!existingRecord) {
      return null;
    }

    await assertRelations(businessId, payload);
    const amounts = normalizeInvoiceAmounts(payload, existingRecord);
    const dueDate = payload.dueDate ?? existingRecord.dueDate;

    return prisma.invoice.update({
      where: { id: billingId },
      data: {
        invoiceNumber: payload.invoiceNumber,
        customerId: payload.customerId,
        shipmentId: payload.shipmentId,
        issueDate: payload.issueDate,
        dueDate,
        subtotal: amounts.subtotal,
        taxAmount: amounts.taxAmount,
        totalAmount: amounts.totalAmount,
        paidAmount: amounts.paidAmount,
        balanceAmount: amounts.balanceAmount,
        status: deriveInvoiceStatus(dueDate, amounts.paidAmount, amounts.totalAmount, payload.status),
        notes: payload.notes,
      },
      include: billingInclude,
    });
  }

  async remove(businessId: string, billingId: string): Promise<boolean> {
    const existingRecord = await prisma.invoice.findFirst({
      where: {
        id: billingId,
        businessId,
      },
      select: { id: true },
    });

    if (!existingRecord) {
      return false;
    }

    await prisma.invoice.delete({
      where: { id: billingId },
    });

    return true;
  }

  async getSummary(businessId: string, query: BillingSummaryQuery): Promise<BillingSummaryResult> {
    const invoices = await prisma.invoice.findMany({
      where: {
        businessId,
        customerId: query.customerId,
        issueDate: query.from || query.to
          ? {
              gte: query.from,
              lte: query.to,
            }
          : undefined,
      },
      select: {
        status: true,
        totalAmount: true,
        paidAmount: true,
        balanceAmount: true,
      },
    });

    const statusBreakdownMap = new Map<InvoiceStatus, { count: number; amount: number }>();
    let totalRevenue = 0;
    let paidRevenue = 0;
    let outstandingBalance = 0;
    let overdueBalance = 0;

    for (const invoice of invoices) {
      totalRevenue += invoice.totalAmount;
      paidRevenue += invoice.paidAmount;
      outstandingBalance += invoice.balanceAmount;

      if (invoice.status === InvoiceStatus.OVERDUE) {
        overdueBalance += invoice.balanceAmount;
      }

      const existing = statusBreakdownMap.get(invoice.status) ?? { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += invoice.totalAmount;
      statusBreakdownMap.set(invoice.status, existing);
    }

    return {
      totals: {
        invoices: invoices.length,
        totalRevenue,
        paidRevenue,
        outstandingBalance,
        overdueBalance,
      },
      statusBreakdown: Array.from(statusBreakdownMap.entries()).map(([status, values]) => ({
        status,
        count: values.count,
        amount: values.amount,
      })),
    };
  }
}

export const billingRepository = new BillingRepository();
