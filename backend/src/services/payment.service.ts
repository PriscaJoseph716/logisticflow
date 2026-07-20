import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { safeTrim, safeUpper } from "../utils/json.js";

export class PaymentService {
  async list(businessId: string) {
    return prisma.payment.findMany({
      where: { businessId },
      include: { invoice: true },
      orderBy: { paidAt: "desc" },
    });
  }

  async create(
    businessId: string,
    input: {
      amount: number;
      invoiceId: string;
      method?: string | null;
      note?: string | null;
      paidAt?: string;
      paymentDate?: string;
    },
  ) {
    const amount = Number(input.amount);
    if (!input.invoiceId || !Number.isFinite(amount) || amount <= 0) {
      throw new AppError("invoiceId and a positive amount are required.");
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: input.invoiceId, businessId },
    });
    if (!invoice) throw new AppError("Invoice not found.", 404);

    const paidAt = new Date(input.paidAt || input.paymentDate || Date.now());

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          businessId,
          invoiceId: invoice.id,
          amount,
          method: safeUpper(input.method, "CASH") || "CASH",
          note: safeTrim(input.note),
          paidAt,
        },
        include: { invoice: true },
      });

      const newPaidAmount = invoice.paidAmount + amount;
      const status = newPaidAmount >= invoice.totalAmount ? "PAID" : "PARTIAL";

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          status,
        },
      });

      return payment;
    });
  }

  async update(
    businessId: string,
    id: string,
    input: {
      amount?: number;
      method?: string | null;
      note?: string | null;
      paidAt?: string;
      paymentDate?: string;
    },
  ) {
    const existing = await prisma.payment.findFirst({
      where: { id, businessId },
      include: { invoice: true },
    });
    if (!existing) throw new AppError("Payment not found.", 404);

    return prisma.$transaction(async (tx) => {
      const nextAmount =
        input.amount !== undefined ? Number(input.amount) : existing.amount;
      if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
        throw new AppError("amount must be a positive number.");
      }

      const payment = await tx.payment.update({
        where: { id },
        data: {
          amount: nextAmount,
          ...(input.method !== undefined
            ? { method: safeUpper(input.method, "CASH") || "CASH" }
            : {}),
          ...(input.note !== undefined ? { note: safeTrim(input.note) } : {}),
          ...(input.paidAt !== undefined || input.paymentDate !== undefined
            ? { paidAt: new Date(input.paidAt || input.paymentDate || Date.now()) }
            : {}),
        },
        include: { invoice: true },
      });

      if (existing.invoiceId && existing.invoice) {
        const delta = nextAmount - existing.amount;
        const newPaidAmount = existing.invoice.paidAmount + delta;
        await tx.invoice.update({
          where: { id: existing.invoiceId },
          data: {
            paidAmount: newPaidAmount,
            status: newPaidAmount >= existing.invoice.totalAmount ? "PAID" : "PARTIAL",
          },
        });
      }

      return payment;
    });
  }

  async remove(businessId: string, id: string) {
    const existing = await prisma.payment.findFirst({
      where: { id, businessId },
      include: { invoice: true },
    });
    if (!existing) throw new AppError("Payment not found.", 404);

    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id } });

      if (existing.invoiceId && existing.invoice) {
        const newPaidAmount = Math.max(0, existing.invoice.paidAmount - existing.amount);
        const status =
          newPaidAmount <= 0
            ? "OPEN"
            : newPaidAmount >= existing.invoice.totalAmount
              ? "PAID"
              : "PARTIAL";

        await tx.invoice.update({
          where: { id: existing.invoiceId },
          data: { paidAmount: newPaidAmount, status },
        });
      }
    });

    return { id };
  }
}

export const paymentService = new PaymentService();
