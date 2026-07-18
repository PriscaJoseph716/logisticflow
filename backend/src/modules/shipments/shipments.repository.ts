import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";
import type {
  ShipmentCreateInput,
  ShipmentListQuery,
  ShipmentListResult,
  ShipmentRecord,
  ShipmentUpdateInput,
  ShipmentSortField,
  SortOrder,
  shipmentInclude,
} from "./shipments.types.js";
import { shipmentInclude as shipmentRelations } from "./shipments.types.js";

function buildOrderBy(sortBy: ShipmentSortField, sortOrder: SortOrder): Prisma.ShipmentOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

async function assertRelatedEntityOwnership(businessId: string, payload: ShipmentCreateInput | ShipmentUpdateInput) {
  const checks = await Promise.all([
    payload.customerId ? prisma.customer.findFirst({ where: { id: payload.customerId, businessId }, select: { id: true } }) : null,
    payload.supplierId ? prisma.supplier.findFirst({ where: { id: payload.supplierId, businessId }, select: { id: true } }) : null,
    payload.vehicleId ? prisma.vehicle.findFirst({ where: { id: payload.vehicleId, businessId }, select: { id: true } }) : null,
    payload.driverId ? prisma.driver.findFirst({ where: { id: payload.driverId, businessId }, select: { id: true } }) : null,
  ]);

  if (payload.customerId && !checks[0]) {
    throw new AppError("Customer not found for this business.", 404, "CUSTOMER_NOT_FOUND");
  }

  if (payload.supplierId && !checks[1]) {
    throw new AppError("Supplier not found for this business.", 404, "SUPPLIER_NOT_FOUND");
  }

  if (payload.vehicleId && !checks[2]) {
    throw new AppError("Vehicle not found for this business.", 404, "VEHICLE_NOT_FOUND");
  }

  if (payload.driverId && !checks[3]) {
    throw new AppError("Driver not found for this business.", 404, "DRIVER_NOT_FOUND");
  }
}

function buildWhereClause(businessId: string, query: ShipmentListQuery): Prisma.ShipmentWhereInput {
  return {
    businessId,
    status: query.status,
    deliveryStatus: query.deliveryStatus,
    customerId: query.customerId,
    supplierId: query.supplierId,
    vehicleId: query.vehicleId,
    driverId: query.driverId,
    scheduledDate: query.scheduledFrom || query.scheduledTo
      ? {
          gte: query.scheduledFrom,
          lte: query.scheduledTo,
        }
      : undefined,
    OR: query.search
      ? [
          { shipmentCode: { contains: query.search, mode: "insensitive" } },
          { origin: { contains: query.search, mode: "insensitive" } },
          { destination: { contains: query.search, mode: "insensitive" } },
          { trackingReference: { contains: query.search, mode: "insensitive" } },
          { cargoDescription: { contains: query.search, mode: "insensitive" } },
          { customer: { is: { name: { contains: query.search, mode: "insensitive" } } } },
          { supplier: { is: { name: { contains: query.search, mode: "insensitive" } } } },
          { driver: { is: { fullName: { contains: query.search, mode: "insensitive" } } } },
          { vehicle: { is: { name: { contains: query.search, mode: "insensitive" } } } },
        ]
      : undefined,
  };
}

export class ShipmentsRepository {
  async list(businessId: string, query: ShipmentListQuery): Promise<ShipmentListResult> {
    const where = buildWhereClause(businessId, query);
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: shipmentRelations,
        orderBy: buildOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: query.pageSize,
      }),
      prisma.shipment.count({ where }),
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

  async findById(businessId: string, shipmentId: string): Promise<ShipmentRecord | null> {
    return prisma.shipment.findFirst({
      where: {
        id: shipmentId,
        businessId,
      },
      include: shipmentRelations,
    });
  }

  async create(businessId: string, payload: ShipmentCreateInput): Promise<ShipmentRecord> {
    await assertRelatedEntityOwnership(businessId, payload);

    return prisma.shipment.create({
      data: {
        businessId,
        shipmentCode: payload.shipmentCode,
        customerId: payload.customerId,
        supplierId: payload.supplierId,
        vehicleId: payload.vehicleId,
        driverId: payload.driverId,
        origin: payload.origin,
        destination: payload.destination,
        cargoDescription: payload.cargoDescription,
        quantityTons: payload.quantityTons,
        status: payload.status,
        deliveryStatus: payload.deliveryStatus,
        scheduledDate: payload.scheduledDate,
        pickupDate: payload.pickupDate,
        deliveredAt: payload.deliveredAt,
        trackingReference: payload.trackingReference,
        notes: payload.notes,
      },
      include: shipmentRelations,
    });
  }

  async update(businessId: string, shipmentId: string, payload: ShipmentUpdateInput): Promise<ShipmentRecord | null> {
    const existingShipment = await prisma.shipment.findFirst({
      where: {
        id: shipmentId,
        businessId,
      },
      select: { id: true },
    });

    if (!existingShipment) {
      return null;
    }

    await assertRelatedEntityOwnership(businessId, payload);

    return prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        shipmentCode: payload.shipmentCode,
        customerId: payload.customerId,
        supplierId: payload.supplierId,
        vehicleId: payload.vehicleId,
        driverId: payload.driverId,
        origin: payload.origin,
        destination: payload.destination,
        cargoDescription: payload.cargoDescription,
        quantityTons: payload.quantityTons,
        status: payload.status,
        deliveryStatus: payload.deliveryStatus,
        scheduledDate: payload.scheduledDate,
        pickupDate: payload.pickupDate,
        deliveredAt: payload.deliveredAt,
        trackingReference: payload.trackingReference,
        notes: payload.notes,
      },
      include: shipmentRelations,
    });
  }

  async remove(businessId: string, shipmentId: string): Promise<boolean> {
    const existingShipment = await prisma.shipment.findFirst({
      where: {
        id: shipmentId,
        businessId,
      },
      select: { id: true },
    });

    if (!existingShipment) {
      return false;
    }

    await prisma.shipment.delete({
      where: { id: shipmentId },
    });

    return true;
  }
}

export const shipmentsRepository = new ShipmentsRepository();
