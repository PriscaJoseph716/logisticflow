import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { safeTrim, safeUpper } from "../utils/json.js";

const shipmentInclude = {
  customer: true,
  supplier: true,
  vehicle: true,
  driver: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
} as const;

function codeSuffix(id: string) {
  return id.replace(/-/g, "").slice(-6).toUpperCase();
}

export class ShipmentService {
  async list(businessId: string) {
    return prisma.shipment.findMany({
      where: { businessId },
      include: shipmentInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(
    businessId: string,
    input: {
      shipmentCode: string;
      supplierId?: string | null;
      customerId?: string | null;
      vehicleId?: string | null;
      driverId?: string | null;
      origin?: string;
      destination?: string;
      quantityTons?: number;
      status?: string;
      deliveryStatus?: string;
      scheduledDate?: string | null;
    },
  ) {
    const shipmentCode = safeTrim(input.shipmentCode);
    if (!shipmentCode) throw new AppError("shipmentCode is required.");

    await this.assertRelations(businessId, input);

    return prisma.shipment.create({
      data: {
        businessId,
        shipmentCode,
        supplierId: input.supplierId || null,
        customerId: input.customerId || null,
        vehicleId: input.vehicleId || null,
        driverId: input.driverId || null,
        origin: safeTrim(input.origin),
        destination: safeTrim(input.destination),
        quantityTons: Number(input.quantityTons ?? 0),
        status: safeUpper(input.status, "PENDING") || "PENDING",
        deliveryStatus: safeUpper(input.deliveryStatus, "SCHEDULED") || "SCHEDULED",
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
      },
      include: shipmentInclude,
    });
  }

  async update(
    businessId: string,
    id: string,
    input: {
      shipmentCode?: string;
      supplierId?: string | null;
      customerId?: string | null;
      vehicleId?: string | null;
      driverId?: string | null;
      origin?: string;
      destination?: string;
      quantityTons?: number;
      status?: string;
      deliveryStatus?: string;
      scheduledDate?: string | null;
    },
  ) {
    const existing = await prisma.shipment.findFirst({
      where: { id, businessId },
      include: { supplier: true, deliveries: true, invoices: true },
    });
    if (!existing) throw new AppError("Shipment not found.", 404);

    await this.assertRelations(businessId, input);

    const nextStatus =
      input.status !== undefined
        ? safeUpper(input.status, existing.status) || existing.status
        : existing.status;

    const shipment = await prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { id },
        data: {
          ...(input.shipmentCode !== undefined
            ? { shipmentCode: safeTrim(input.shipmentCode) }
            : {}),
          ...(input.supplierId !== undefined ? { supplierId: input.supplierId || null } : {}),
          ...(input.customerId !== undefined ? { customerId: input.customerId || null } : {}),
          ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId || null } : {}),
          ...(input.driverId !== undefined ? { driverId: input.driverId || null } : {}),
          ...(input.origin !== undefined ? { origin: safeTrim(input.origin) } : {}),
          ...(input.destination !== undefined ? { destination: safeTrim(input.destination) } : {}),
          ...(input.quantityTons !== undefined
            ? { quantityTons: Number(input.quantityTons) }
            : {}),
          ...(input.status !== undefined ? { status: nextStatus } : {}),
          ...(input.deliveryStatus !== undefined
            ? { deliveryStatus: safeUpper(input.deliveryStatus, "SCHEDULED") || "SCHEDULED" }
            : {}),
          ...(input.scheduledDate !== undefined
            ? { scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null }
            : {}),
          ...(nextStatus === "DELIVERED" ? { deliveryStatus: "DELIVERED" } : {}),
        },
        include: shipmentInclude,
      });

      if (nextStatus === "DELIVERED" && existing.status !== "DELIVERED") {
        const suffix = codeSuffix(existing.id);
        const customerId = updated.customerId ?? existing.customerId;
        const vehicleId = updated.vehicleId ?? existing.vehicleId;
        const quantityTons = updated.quantityTons;
        const supplier = updated.supplier ?? existing.supplier;

        if (existing.deliveries.length === 0) {
          await tx.delivery.create({
            data: {
              businessId,
              deliveryCode: `DEL-${suffix}`,
              shipmentId: existing.id,
              customerId,
              vehicleId,
              status: "COMPLETED",
              deliveredAt: new Date(),
            },
          });
        }

        if (existing.invoices.length === 0) {
          const unitPrice = supplier?.sellingPrice || 0;
          const totalAmount = quantityTons * (unitPrice || 100000);
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);

          await tx.invoice.create({
            data: {
              businessId,
              invoiceNumber: `INV-${suffix}`,
              customerId,
              shipmentId: existing.id,
              totalAmount,
              paidAmount: 0,
              status: "OPEN",
              dueDate,
            },
          });
        }
      }

      return updated;
    });

    return prisma.shipment.findFirstOrThrow({
      where: { id: shipment.id },
      include: shipmentInclude,
    });
  }

  async remove(businessId: string, id: string) {
    const existing = await prisma.shipment.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Shipment not found.", 404);
    await prisma.shipment.delete({ where: { id } });
    return { id };
  }

  private async assertRelations(
    businessId: string,
    input: {
      supplierId?: string | null;
      customerId?: string | null;
      vehicleId?: string | null;
      driverId?: string | null;
    },
  ) {
    if (input.supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: { id: input.supplierId, businessId },
      });
      if (!supplier) throw new AppError("Supplier not found.", 404);
    }
    if (input.customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: input.customerId, businessId },
      });
      if (!customer) throw new AppError("Customer not found.", 404);
    }
    if (input.vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: input.vehicleId, businessId },
      });
      if (!vehicle) throw new AppError("Vehicle not found.", 404);
    }
    if (input.driverId) {
      const driver = await prisma.user.findFirst({
        where: { id: input.driverId, businessId },
      });
      if (!driver) throw new AppError("Driver not found.", 404);
    }
  }
}

export const shipmentService = new ShipmentService();
