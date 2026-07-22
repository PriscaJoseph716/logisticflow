import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { safeTrim } from "../utils/json.js";

async function nextOrderCode(businessId: string) {
  const count = await prisma.orderRequest.count({ where: { businessId } });
  let seq = count + 1;
  for (let i = 0; i < 20; i += 1) {
    const orderCode = `ORD-${String(seq).padStart(4, "0")}`;
    const exists = await prisma.orderRequest.findFirst({
      where: { businessId, orderCode },
      select: { id: true },
    });
    if (!exists) return orderCode;
    seq += 1;
  }
  return `ORD-${Date.now().toString().slice(-6)}`;
}

export class PortalService {
  async dashboard(businessId: string, customerId: string) {
    const [invoices, shipments, orders, notifications] = await Promise.all([
      prisma.invoice.findMany({
        where: { businessId, customerId },
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.shipment.findMany({
        where: { businessId, customerId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderRequest.findMany({
        where: { businessId, customerId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customerNotification.findMany({
        where: { businessId, customerId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!customer) throw new AppError("Customer not found.", 404);

    const billed = invoices.reduce((sum, item) => sum + item.totalAmount, 0);
    const paid = invoices.reduce((sum, item) => sum + item.paidAmount, 0);
    const outstanding = Math.max(0, billed - paid);
    const availableCredit = Math.max(0, (customer.creditLimit || 0) - outstanding);

    const pendingOrders = orders.filter((item) =>
      ["PENDING_APPROVAL", "PENDING", "APPROVED"].includes(item.status),
    ).length;
    const deliveredOrders =
      shipments.filter((item) => item.status === "DELIVERED").length +
      orders.filter((item) => item.status === "DELIVERED").length;

    return {
      outstandingBalance: outstanding,
      availableCredit,
      orders: orders.length + shipments.length,
      pendingOrders,
      deliveredOrders,
      invoices: invoices.length,
      payments: invoices.reduce((sum, item) => sum + item.payments.length, 0),
      notifications,
    };
  }

  async listOrders(businessId: string, customerId: string) {
    const [orders, shipments] = await Promise.all([
      prisma.orderRequest.findMany({
        where: { businessId, customerId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.shipment.findMany({
        where: { businessId, customerId },
        include: {
          vehicle: true,
          driver: { select: { id: true, fullName: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { orders, shipments };
  }

  async createOrder(
    businessId: string,
    customerId: string,
    input: {
      origin?: string;
      destination?: string;
      cargoType?: string;
      quantity?: number;
      weight?: number;
      preferredPickupDate?: string | null;
      notes?: string;
    },
  ) {
    const origin = safeTrim(input.origin);
    const destination = safeTrim(input.destination);
    if (!origin || !destination) {
      throw new AppError("Origin and destination are required.");
    }

    const orderCode = await nextOrderCode(businessId);
    const order = await prisma.orderRequest.create({
      data: {
        businessId,
        customerId,
        orderCode,
        origin,
        destination,
        cargoType: safeTrim(input.cargoType) || "Cement",
        quantity: Number(input.quantity ?? 0),
        weight: Number(input.weight ?? 0),
        preferredPickupDate: input.preferredPickupDate
          ? new Date(input.preferredPickupDate)
          : null,
        notes: safeTrim(input.notes),
        status: "PENDING_APPROVAL",
      },
    });

    await prisma.customerNotification.create({
      data: {
        businessId,
        customerId,
        title: "Order submitted",
        message: `Your order ${orderCode} is pending approval.`,
        type: "ORDER",
      },
    });

    return order;
  }

  async listInvoices(businessId: string, customerId: string) {
    return prisma.invoice.findMany({
      where: { businessId, customerId },
      include: { payments: { orderBy: { paidAt: "desc" } }, shipment: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getInvoice(businessId: string, customerId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, businessId, customerId },
      include: { payments: { orderBy: { paidAt: "desc" } }, shipment: true, customer: true },
    });
    if (!invoice) throw new AppError("Invoice not found.", 404);
    return invoice;
  }

  async listPayments(businessId: string, customerId: string) {
    return prisma.payment.findMany({
      where: {
        businessId,
        invoice: { customerId },
      },
      include: { invoice: true },
      orderBy: { paidAt: "desc" },
    });
  }

  async accountStatement(businessId: string, customerId: string) {
    const invoices = await this.listInvoices(businessId, customerId);
    const payments = await this.listPayments(businessId, customerId);
    const billed = invoices.reduce((sum, item) => sum + item.totalAmount, 0);
    const paid = invoices.reduce((sum, item) => sum + item.paidAmount, 0);
    return {
      invoices,
      payments,
      totals: {
        billed,
        paid,
        outstanding: Math.max(0, billed - paid),
      },
    };
  }

  async tracking(businessId: string, customerId: string) {
    const shipments = await prisma.shipment.findMany({
      where: { businessId, customerId },
      include: {
        vehicle: true,
        driver: { select: { id: true, fullName: true, phone: true } },
        deliveries: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return shipments.map((shipment) => ({
      shipmentNumber: shipment.shipmentCode,
      vehicle: shipment.vehicle?.headPlateNumber ?? "—",
      driver: shipment.driver?.fullName ?? "—",
      driverPhone: shipment.driver?.phone ?? "",
      status: shipment.status,
      deliveryStatus: shipment.deliveryStatus,
      deliveryDate: shipment.deliveries[0]?.deliveredAt ?? null,
      proofOfDelivery: shipment.deliveries[0]
        ? {
            deliveryCode: shipment.deliveries[0].deliveryCode,
            deliveredAt: shipment.deliveries[0].deliveredAt,
            status: shipment.deliveries[0].status,
          }
        : null,
      origin: shipment.origin,
      destination: shipment.destination,
      quantity: shipment.quantityTons,
      date: shipment.scheduledDate ?? shipment.createdAt,
    }));
  }

  async listNotifications(businessId: string, customerId: string) {
    return prisma.customerNotification.findMany({
      where: { businessId, customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markNotificationRead(businessId: string, customerId: string, id: string) {
    const existing = await prisma.customerNotification.findFirst({
      where: { id, businessId, customerId },
    });
    if (!existing) throw new AppError("Notification not found.", 404);
    return prisma.customerNotification.update({
      where: { id },
      data: { status: "READ" },
    });
  }

  async updateProfile(
    businessId: string,
    customerId: string,
    input: {
      phone?: string;
      email?: string | null;
      notifyEmail?: boolean;
      notifySms?: boolean;
    },
  ) {
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!existing) throw new AppError("Customer not found.", 404);

    return prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(input.phone !== undefined ? { phone: safeTrim(input.phone) } : {}),
        ...(input.email !== undefined ? { email: safeTrim(input.email) || null } : {}),
        ...(input.notifyEmail !== undefined ? { notifyEmail: Boolean(input.notifyEmail) } : {}),
        ...(input.notifySms !== undefined ? { notifySms: Boolean(input.notifySms) } : {}),
      },
    });
  }

  /** Admin: list pending order requests for the business */
  async listBusinessOrderRequests(businessId: string) {
    return prisma.orderRequest.findMany({
      where: { businessId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOrderRequestStatus(
    businessId: string,
    orderId: string,
    status: string,
  ) {
    const existing = await prisma.orderRequest.findFirst({
      where: { id: orderId, businessId },
    });
    if (!existing) throw new AppError("Order request not found.", 404);

    const updated = await prisma.orderRequest.update({
      where: { id: orderId },
      data: { status: safeTrim(status).toUpperCase() || existing.status },
    });

    await prisma.customerNotification.create({
      data: {
        businessId,
        customerId: existing.customerId,
        title: "Order status updated",
        message: `Order ${existing.orderCode} is now ${updated.status.replaceAll("_", " ").toLowerCase()}.`,
        type: "ORDER",
      },
    });

    return updated;
  }
}

export const portalService = new PortalService();
