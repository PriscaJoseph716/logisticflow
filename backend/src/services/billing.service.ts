import { prisma } from "../config/database.js";

export class BillingService {
  async list(businessId: string) {
    return prisma.invoice.findMany({
      where: { businessId },
      include: {
        customer: true,
        payments: { orderBy: { paidAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async summary(businessId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { businessId },
      select: { totalAmount: true, paidAmount: true, status: true, dueDate: true },
    });

    const now = new Date();
    let openAmount = 0;
    let paidAmount = 0;
    let overdueCount = 0;

    for (const invoice of invoices) {
      paidAmount += invoice.paidAmount;
      const remaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);
      if (invoice.status !== "PAID") {
        openAmount += remaining;
      }
      if (
        invoice.status !== "PAID" &&
        invoice.dueDate &&
        invoice.dueDate < now &&
        remaining > 0
      ) {
        overdueCount += 1;
      }
    }

    return {
      openAmount,
      paidAmount,
      overdueCount,
      invoiceCount: invoices.length,
    };
  }
}

export const billingService = new BillingService();
