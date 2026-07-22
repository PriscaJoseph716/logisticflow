import { prisma } from "../config/database.js";
import { calculateTruckLoadInvoiceAmount } from "../utils/truck-pricing.js";

export class BillingService {
  async list(businessId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { businessId },
      include: {
        customer: true,
        payments: { orderBy: { paidAt: "desc" } },
        shipment: { include: { supplier: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Unpaid invoices: always bill truck selling price × (bags ÷ 600), never bags × price.
    for (const invoice of invoices) {
      if (invoice.paidAmount > 0) continue;
      const bags = invoice.shipment?.quantityTons;
      const truckPrice = invoice.shipment?.supplier?.sellingPrice;
      if (bags == null || truckPrice == null || truckPrice <= 0) continue;

      const correctTotal = calculateTruckLoadInvoiceAmount(bags, truckPrice);
      if (Math.abs(invoice.totalAmount - correctTotal) < 0.01) continue;

      const updated = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          totalAmount: correctTotal,
          status: "OPEN",
        },
      });
      invoice.totalAmount = updated.totalAmount;
      invoice.status = updated.status;
    }

    return invoices;
  }

  async summary(businessId: string) {
    // Ensure inflated invoices are corrected before totals are computed.
    await this.list(businessId);

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
