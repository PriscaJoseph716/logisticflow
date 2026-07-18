import { InvoiceStatus, PaymentStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";
import type {
  PaymentCreateInput,
  PaymentListQuery,
  PaymentListResult,
  PaymentRecord,
  PaymentSortField,
  SortOrder,
  PaymentUpdateInput,
} from "./payments.types.js";
import { paymentInclude } from "./payments.types.js";

function buildOrderBy(sortBy: PaymentSortField, sortOrder: SortOrder): Prisma.PaymentOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

function buildWhereClause(businessId: string, query: PaymentListQuery): Prisma.PaymentWhereInput {
  return {
    businessId,
    status: query.status,
    method: query.method,
    customerId: query.customerId,
    invoiceId: query.invoiceId,
    paymentDate: query.paymentDateFrom || query.paymentDateTo
      ? {
          gte: query.paymentDateFrom,
          lte: query.paymentDateTo,
        }
      : undefined,
    OR: query.search
      ? [
          { reference: { contains: query.search, mode: "insensitive" } },
          { notes: { contains: query.search, mode: "insensitive" } },
          { customer: { is: { name: { contains: query.search, mode: "insensitive" } } } },
          { invoice: { is: { invoiceNumber: { contains: query.search, mode: "insensitive" } } } },
        ]
      : undefined,
  };
}

async function assertRelations(
  businessId: string,
  payload: PaymentCreateInput | PaymentUpdateInput,
): Promise<{ resolvedCustomerId?: string }> {
  const invoice = payload.invoiceId
    ? await prisma.invoice.findFirst({
        where: {
          id: payload.invoiceId,
          businessId,
        },
        select: {
          id: true,
          customerId: true,
        },
      })
    : null;

  if (payload.invoiceId && !invoice) {
    throw new AppError("Invoice not found for this business.", 404, "INVOICE_NOT_FOUND");
  }

  const customerId = payload.customerId ?? invoice?.customerId ?? undefined;
  if (customerId) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId,
      },
      select: { id: true },
    });

    if (!customer) {
      throw new AppError("Customer not found for this business.", 404, "CUSTOMER_NOT_FOUND");
    }
  }

  return {
    resolvedCustomerId: customerId,
  };
}

async function syncInvoiceAmounts(transaction: Prisma.TransactionClient, businessId: string, invoiceId?: string | null) {
  if (!invoiceId) {
    return;
  }

  const invoice = await transaction.invoice.findFirst({
    where: {
      id: invoiceId,
      businessId,
    },
    include: {
      payments: true,
    },
  });

  if (!invoice) {
    return;
  }

  const paidAmount = invoice.payments
    .filter((payment) => payment.status === PaymentStatus.COMPLETED)
    .reduce((total, payment) => total + payment.amount, 0);
  const balanceAmount = Math.max(invoice.totalAmount - paidAmount, 0);

  let status = invoice.status;
  if (paidAmount >= invoice.totalAmount && invoice.totalAmount > 0) {
    status = InvoiceStatus.PAID;
  } else if (paidAmount > 0) {
    status = InvoiceStatus.PARTIAL;
  } else if (invoice.dueDate < new Date()) {
    status = InvoiceStatus.OVERDUE;
  } else if (invoice.status !== InvoiceStatus.CANCELLED) {
    status = InvoiceStatus.SENT;
  }

  await transaction.invoice.update({
    where: { id: invoice.id },
    data: {
      paidAmount,
      balanceAmount,
      status,
    },
  });
}

export class PaymentsRepository {
  async list(businessId: string, query: PaymentListQuery): Promise<PaymentListResult> {
    const where = buildWhereClause(businessId, query);
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: paymentInclude,
        orderBy: buildOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: query.pageSize,
      }),
      prisma.payment.count({ where }),
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

  async findById(businessId: string, paymentId: string): Promise<PaymentRecord | null> {
    return prisma.payment.findFirst({
      where: {
        id: paymentId,
        businessId,
      },
      include: paymentInclude,
    });
  }

  async create(businessId: string, payload: PaymentCreateInput): Promise<PaymentRecord> {
    const { resolvedCustomerId } = await assertRelations(businessId, payload);

    return prisma.$transaction(async (transaction) => {
      const payment = await transaction.payment.create({
        data: {
          businessId,
          invoiceId: payload.invoiceId,
          customerId: resolvedCustomerId,
          amount: payload.amount,
          paymentDate: payload.paymentDate,
          method: payload.method,
          reference: payload.reference,
          status: payload.status ?? PaymentStatus.PENDING,
          notes: payload.notes,
        },
      });

      await syncInvoiceAmounts(transaction, businessId, payload.invoiceId);

      return transaction.payment.findUniqueOrThrow({
        where: { id: payment.id },
        include: paymentInclude,
      });
    });
  }

  async update(businessId: string, paymentId: string, payload: PaymentUpdateInput): Promise<PaymentRecord | null> {
    const existingRecord = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        businessId,
      },
    });

    if (!existingRecord) {
      return null;
    }

    const { resolvedCustomerId } = await assertRelations(businessId, payload);

    return prisma.$transaction(async (transaction) => {
      const payment = await transaction.payment.update({
        where: { id: paymentId },
        data: {
          invoiceId: payload.invoiceId,
          customerId: resolvedCustomerId,
          amount: payload.amount,
          paymentDate: payload.paymentDate,
          method: payload.method,
          reference: payload.reference,
          status: payload.status,
          notes: payload.notes,
        },
      });

      await syncInvoiceAmounts(transaction, businessId, existingRecord.invoiceId);
      await syncInvoiceAmounts(transaction, businessId, payload.invoiceId ?? payment.invoiceId);

      return transaction.payment.findUniqueOrThrow({
        where: { id: payment.id },
        include: paymentInclude,
      });
    });
  }

  async remove(businessId: string, paymentId: string): Promise<boolean> {
    const existingRecord = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        businessId,
      },
      select: {
        id: true,
        invoiceId: true,
      },
    });

    if (!existingRecord) {
      return false;
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.payment.delete({
        where: { id: paymentId },
      });

      await syncInvoiceAmounts(transaction, businessId, existingRecord.invoiceId);
    });

    return true;
  }
}

export const paymentsRepository = new PaymentsRepository();
