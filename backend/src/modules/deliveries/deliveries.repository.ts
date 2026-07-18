import { DeliveryStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";
import type {
  DeliveryCreateInput,
  DeliveryListQuery,
  DeliveryListResult,
  DeliveryRecord,
  DeliveryUpdateInput,
  DeliverySortField,
  SortOrder,
} from "./deliveries.types.js";
import { deliveryInclude } from "./deliveries.types.js";

function buildOrderBy(sortBy: DeliverySortField, sortOrder: SortOrder): Prisma.DeliveryOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

async function assertRelations(businessId: string, payload: DeliveryCreateInput | DeliveryUpdateInput) {
  const [shipment, customer, vehicle, driver] = await Promise.all([
    payload.shipmentId
      ? prisma.shipment.findFirst({ where: { id: payload.shipmentId, businessId }, select: { id: true } })
      : null,
    payload.customerId
      ? prisma.customer.findFirst({ where: { id: payload.customerId, businessId }, select: { id: true } })
      : null,
    payload.vehicleId
      ? prisma.vehicle.findFirst({ where: { id: payload.vehicleId, businessId }, select: { id: true } })
      : null,
    payload.driverId
      ? prisma.driver.findFirst({ where: { id: payload.driverId, businessId }, select: { id: true } })
      : null,
  ]);

  if (payload.shipmentId && !shipment) {
    throw new AppError("Shipment not found for this business.", 404, "SHIPMENT_NOT_FOUND");
  }

  if (payload.customerId && !customer) {
    throw new AppError("Customer not found for this business.", 404, "CUSTOMER_NOT_FOUND");
  }

  if (payload.vehicleId && !vehicle) {
    throw new AppError("Vehicle not found for this business.", 404, "VEHICLE_NOT_FOUND");
  }

  if (payload.driverId && !driver) {
    throw new AppError("Driver not found for this business.", 404, "DRIVER_NOT_FOUND");
  }
}

function buildWhereClause(businessId: string, query: DeliveryListQuery): Prisma.DeliveryWhereInput {
  return {
    businessId,
    status: query.status,
    shipmentId: query.shipmentId,
    customerId: query.customerId,
    vehicleId: query.vehicleId,
    driverId: query.driverId,
    deliveredAt: query.deliveredFrom || query.deliveredTo
      ? {
          gte: query.deliveredFrom,
          lte: query.deliveredTo,
        }
      : undefined,
    OR: query.search
      ? [
          { deliveryCode: { contains: query.search, mode: "insensitive" } },
          { recipientName: { contains: query.search, mode: "insensitive" } },
          { recipientPhone: { contains: query.search, mode: "insensitive" } },
          { notes: { contains: query.search, mode: "insensitive" } },
          { shipment: { is: { shipmentCode: { contains: query.search, mode: "insensitive" } } } },
          { customer: { is: { name: { contains: query.search, mode: "insensitive" } } } },
          { vehicle: { is: { name: { contains: query.search, mode: "insensitive" } } } },
          { driver: { is: { fullName: { contains: query.search, mode: "insensitive" } } } },
        ]
      : undefined,
  };
}

async function syncShipmentDeliveryState(
  transaction: Prisma.TransactionClient,
  businessId: string,
  shipmentId: string | null | undefined,
  status?: DeliveryStatus,
  deliveredAt?: Date | null,
) {
  if (!shipmentId) {
    return;
  }

  await transaction.shipment.updateMany({
    where: {
      id: shipmentId,
      businessId,
    },
    data: {
      deliveryStatus: status,
      deliveredAt: status === DeliveryStatus.COMPLETED ? deliveredAt ?? new Date() : null,
    },
  });
}

export class DeliveriesRepository {
  async list(businessId: string, query: DeliveryListQuery): Promise<DeliveryListResult> {
    const where = buildWhereClause(businessId, query);
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      prisma.delivery.findMany({
        where,
        include: deliveryInclude,
        orderBy: buildOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: query.pageSize,
      }),
      prisma.delivery.count({ where }),
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

  async findById(businessId: string, deliveryId: string): Promise<DeliveryRecord | null> {
    return prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        businessId,
      },
      include: deliveryInclude,
    });
  }

  async create(businessId: string, payload: DeliveryCreateInput): Promise<DeliveryRecord> {
    await assertRelations(businessId, payload);

    return prisma.$transaction(async (transaction) => {
      const delivery = await transaction.delivery.create({
        data: {
          businessId,
          deliveryCode: payload.deliveryCode,
          shipmentId: payload.shipmentId,
          customerId: payload.customerId,
          vehicleId: payload.vehicleId,
          driverId: payload.driverId,
          status: payload.status,
          deliveredAt: payload.deliveredAt,
          proofOfDeliveryUrl: payload.proofOfDeliveryUrl,
          recipientName: payload.recipientName,
          recipientPhone: payload.recipientPhone,
          notes: payload.notes,
        },
      });

      await syncShipmentDeliveryState(
        transaction,
        businessId,
        payload.shipmentId,
        payload.status ?? DeliveryStatus.SCHEDULED,
        payload.deliveredAt,
      );

      return transaction.delivery.findUniqueOrThrow({
        where: { id: delivery.id },
        include: deliveryInclude,
      });
    });
  }

  async update(businessId: string, deliveryId: string, payload: DeliveryUpdateInput): Promise<DeliveryRecord | null> {
    const existingDelivery = await prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        businessId,
      },
      select: {
        id: true,
        shipmentId: true,
      },
    });

    if (!existingDelivery) {
      return null;
    }

    await assertRelations(businessId, payload);

    return prisma.$transaction(async (transaction) => {
      const delivery = await transaction.delivery.update({
        where: { id: deliveryId },
        data: {
          deliveryCode: payload.deliveryCode,
          shipmentId: payload.shipmentId,
          customerId: payload.customerId,
          vehicleId: payload.vehicleId,
          driverId: payload.driverId,
          status: payload.status,
          deliveredAt: payload.deliveredAt,
          proofOfDeliveryUrl: payload.proofOfDeliveryUrl,
          recipientName: payload.recipientName,
          recipientPhone: payload.recipientPhone,
          notes: payload.notes,
        },
      });

      const activeShipmentId = payload.shipmentId ?? existingDelivery.shipmentId;
      await syncShipmentDeliveryState(
        transaction,
        businessId,
        activeShipmentId,
        payload.status ?? delivery.status,
        payload.deliveredAt ?? delivery.deliveredAt,
      );

      return transaction.delivery.findUniqueOrThrow({
        where: { id: delivery.id },
        include: deliveryInclude,
      });
    });
  }

  async remove(businessId: string, deliveryId: string): Promise<boolean> {
    const existingDelivery = await prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        businessId,
      },
      select: {
        id: true,
        shipmentId: true,
      },
    });

    if (!existingDelivery) {
      return false;
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.delivery.delete({
        where: { id: deliveryId },
      });

      if (existingDelivery.shipmentId) {
        await transaction.shipment.updateMany({
          where: {
            id: existingDelivery.shipmentId,
            businessId,
          },
          data: {
            deliveryStatus: DeliveryStatus.SCHEDULED,
            deliveredAt: null,
          },
        });
      }
    });

    return true;
  }
}

export const deliveriesRepository = new DeliveriesRepository();
