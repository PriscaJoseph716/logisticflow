import { prisma } from "../config/database.js";

export class DeliveryService {
  async list(businessId: string) {
    return prisma.delivery.findMany({
      where: { businessId },
      include: {
        shipment: true,
        customer: true,
        vehicle: true,
      },
      orderBy: { deliveredAt: "desc" },
    });
  }
}

export const deliveryService = new DeliveryService();
