import { prisma } from "../config/database.js";

export class DashboardService {
  async summary(businessId: string) {
    const [
      vehicles,
      customers,
      suppliers,
      shipments,
      deliveries,
      openInvoices,
      pendingShipments,
      activeVehicles,
    ] = await Promise.all([
      prisma.vehicle.count({ where: { businessId } }),
      prisma.customer.count({ where: { businessId } }),
      prisma.supplier.count({ where: { businessId } }),
      prisma.shipment.count({ where: { businessId } }),
      prisma.delivery.count({ where: { businessId } }),
      prisma.invoice.count({
        where: { businessId, status: { in: ["OPEN", "PARTIAL", "OVERDUE"] } },
      }),
      prisma.shipment.count({ where: { businessId, status: "PENDING" } }),
      prisma.vehicle.count({ where: { businessId, status: "ACTIVE" } }),
    ]);

    return {
      vehicles,
      customers,
      suppliers,
      shipments,
      deliveries,
      openInvoices,
      pendingShipments,
      activeVehicles,
    };
  }
}

export const dashboardService = new DashboardService();
