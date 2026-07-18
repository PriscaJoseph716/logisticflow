import { MaintenanceStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";
import type {
  MaintenanceAnalyticsQuery,
  MaintenanceAnalyticsResult,
  MaintenanceCreateInput,
  MaintenanceListQuery,
  MaintenanceListResult,
  MaintenanceRecord,
  MaintenanceReminderQuery,
  MaintenanceSortField,
  SortOrder,
  MaintenanceUpdateInput,
} from "./maintenance.types.js";
import { maintenanceInclude } from "./maintenance.types.js";

function buildOrderBy(sortBy: MaintenanceSortField, sortOrder: SortOrder): Prisma.MaintenanceRecordOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

function sumPartsCost(parts: Array<{ quantity?: number; unitPrice?: number }>) {
  return parts.reduce((total, part) => total + (part.quantity ?? 1) * (part.unitPrice ?? 0), 0);
}

async function assertVehicleBelongsToBusiness(businessId: string, vehicleId: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      businessId,
    },
    select: {
      id: true,
    },
  });

  if (!vehicle) {
    throw new AppError("Vehicle not found for this business.", 404, "VEHICLE_NOT_FOUND");
  }
}

function buildWhereClause(businessId: string, query: MaintenanceListQuery): Prisma.MaintenanceRecordWhereInput {
  const now = new Date();
  const dueDateLimit = query.dueWithinDays ? new Date(now.getTime() + query.dueWithinDays * 24 * 60 * 60 * 1000) : undefined;

  return {
    businessId,
    status: query.status,
    vehicleId: query.vehicleId,
    maintenanceType: query.maintenanceType
      ? {
          contains: query.maintenanceType,
          mode: "insensitive",
        }
      : undefined,
    maintenanceDate: query.serviceFrom || query.serviceTo
      ? {
          gte: query.serviceFrom,
          lte: query.serviceTo,
        }
      : undefined,
    ...(query.overdueOnly
      ? {
          OR: [
            { status: MaintenanceStatus.OVERDUE },
            { nextServiceDate: { lt: now } },
          ],
        }
      : {}),
    ...(query.upcomingOnly || dueDateLimit
      ? {
          nextServiceDate: {
            gte: now,
            lte: dueDateLimit,
          },
        }
      : {}),
    ...(query.search
      ? {
          AND: [
            {
              OR: [
                { maintenanceType: { contains: query.search, mode: "insensitive" } },
                { workshop: { contains: query.search, mode: "insensitive" } },
                { mechanic: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
                { vehicle: { is: { name: { contains: query.search, mode: "insensitive" } } } },
                { vehicle: { is: { headPlateNumber: { contains: query.search, mode: "insensitive" } } } },
              ],
            },
          ],
        }
      : {}),
  };
}

function buildMaintenanceUpdateData(payload: MaintenanceUpdateInput) {
  const partsCost = payload.parts ? sumPartsCost(payload.parts) : undefined;
  const totalCost =
    payload.parts || payload.laborCost !== undefined || payload.otherCost !== undefined
      ? (payload.laborCost ?? 0) + (partsCost ?? 0) + (payload.otherCost ?? 0)
      : undefined;

  return {
    vehicleId: payload.vehicleId,
    maintenanceDate: payload.maintenanceDate,
    maintenanceType: payload.maintenanceType,
    workshop: payload.workshop,
    mechanic: payload.mechanic,
    description: payload.description,
    currentMileage: payload.currentMileage,
    laborCost: payload.laborCost,
    partsCost,
    otherCost: payload.otherCost,
    totalCost,
    nextServiceDate: payload.nextServiceDate,
    nextServiceMileage: payload.nextServiceMileage,
    status: payload.status,
    timelineJson: payload.timeline,
    upcomingServiceJson: payload.upcomingService,
  } satisfies Prisma.MaintenanceRecordUncheckedUpdateInput;
}

export class MaintenanceRepository {
  async list(businessId: string, query: MaintenanceListQuery): Promise<MaintenanceListResult> {
    const where = buildWhereClause(businessId, query);
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where,
        include: maintenanceInclude,
        orderBy: buildOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: query.pageSize,
      }),
      prisma.maintenanceRecord.count({ where }),
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

  async findById(businessId: string, maintenanceId: string): Promise<MaintenanceRecord | null> {
    return prisma.maintenanceRecord.findFirst({
      where: {
        id: maintenanceId,
        businessId,
      },
      include: maintenanceInclude,
    });
  }

  async create(businessId: string, payload: MaintenanceCreateInput): Promise<MaintenanceRecord> {
    await assertVehicleBelongsToBusiness(businessId, payload.vehicleId);
    const parts = payload.parts ?? [];
    const partsCost = sumPartsCost(parts);

    return prisma.maintenanceRecord.create({
      data: {
        businessId,
        vehicleId: payload.vehicleId,
        maintenanceDate: payload.maintenanceDate,
        maintenanceType: payload.maintenanceType,
        workshop: payload.workshop,
        mechanic: payload.mechanic,
        description: payload.description,
        currentMileage: payload.currentMileage,
        laborCost: payload.laborCost ?? 0,
        partsCost,
        otherCost: payload.otherCost ?? 0,
        totalCost: (payload.laborCost ?? 0) + partsCost + (payload.otherCost ?? 0),
        nextServiceDate: payload.nextServiceDate,
        nextServiceMileage: payload.nextServiceMileage,
        status: payload.status ?? MaintenanceStatus.SCHEDULED,
        timelineJson: payload.timeline,
        upcomingServiceJson: payload.upcomingService,
        parts: parts.length
          ? {
              create: parts.map((part) => ({
                businessId,
                partName: part.partName,
                brand: part.brand,
                quantity: part.quantity ?? 1,
                unitPrice: part.unitPrice ?? 0,
                totalPrice: (part.quantity ?? 1) * (part.unitPrice ?? 0),
                supplier: part.supplier,
              })),
            }
          : undefined,
        attachments: payload.attachments?.length
          ? {
              create: payload.attachments.map((attachment) => ({
                businessId,
                category: attachment.category,
                fileName: attachment.fileName,
                fileUrl: attachment.fileUrl,
                mimeType: attachment.mimeType,
              })),
            }
          : undefined,
      },
      include: maintenanceInclude,
    });
  }

  async update(businessId: string, maintenanceId: string, payload: MaintenanceUpdateInput): Promise<MaintenanceRecord | null> {
    const existingRecord = await prisma.maintenanceRecord.findFirst({
      where: {
        id: maintenanceId,
        businessId,
      },
      include: {
        parts: true,
        attachments: true,
      },
    });

    if (!existingRecord) {
      return null;
    }

    if (payload.vehicleId) {
      await assertVehicleBelongsToBusiness(businessId, payload.vehicleId);
    }

    return prisma.$transaction(async (transaction) => {
      await transaction.maintenanceRecord.update({
        where: { id: maintenanceId },
        data: {
          ...buildMaintenanceUpdateData(payload),
          parts: payload.parts
            ? {
                deleteMany: { businessId },
                create: payload.parts.map((part) => ({
                  businessId,
                  partName: part.partName,
                  brand: part.brand,
                  quantity: part.quantity ?? 1,
                  unitPrice: part.unitPrice ?? 0,
                  totalPrice: (part.quantity ?? 1) * (part.unitPrice ?? 0),
                  supplier: part.supplier,
                })),
              }
            : undefined,
          attachments: payload.attachments
            ? {
                deleteMany: { businessId },
                create: payload.attachments.map((attachment) => ({
                  businessId,
                  category: attachment.category,
                  fileName: attachment.fileName,
                  fileUrl: attachment.fileUrl,
                  mimeType: attachment.mimeType,
                })),
              }
            : undefined,
        },
      });

      return transaction.maintenanceRecord.findUniqueOrThrow({
        where: { id: maintenanceId },
        include: maintenanceInclude,
      });
    });
  }

  async remove(businessId: string, maintenanceId: string): Promise<boolean> {
    const existingRecord = await prisma.maintenanceRecord.findFirst({
      where: {
        id: maintenanceId,
        businessId,
      },
      select: { id: true },
    });

    if (!existingRecord) {
      return false;
    }

    await prisma.maintenanceRecord.delete({
      where: { id: maintenanceId },
    });

    return true;
  }

  async getAnalytics(businessId: string, query: MaintenanceAnalyticsQuery): Promise<MaintenanceAnalyticsResult> {
    const records = await prisma.maintenanceRecord.findMany({
      where: {
        businessId,
        vehicleId: query.vehicleId,
        maintenanceDate: query.from || query.to
          ? {
              gte: query.from,
              lte: query.to,
            }
          : undefined,
      },
      orderBy: {
        maintenanceDate: "asc",
      },
    });

    const now = new Date();
    const statusMap = new Map<MaintenanceStatus, number>();
    const monthlySpend = new Map<string, number>();
    let totalCost = 0;
    let laborCost = 0;
    let partsCost = 0;
    let otherCost = 0;
    let upcomingServiceCount = 0;
    let overdueCount = 0;

    for (const record of records) {
      totalCost += record.totalCost;
      laborCost += record.laborCost;
      partsCost += record.partsCost;
      otherCost += record.otherCost;
      statusMap.set(record.status, (statusMap.get(record.status) ?? 0) + 1);

      const monthKey = `${record.maintenanceDate.getUTCFullYear()}-${String(record.maintenanceDate.getUTCMonth() + 1).padStart(2, "0")}`;
      monthlySpend.set(monthKey, (monthlySpend.get(monthKey) ?? 0) + record.totalCost);

      if (record.nextServiceDate && record.nextServiceDate >= now) {
        upcomingServiceCount += 1;
      }

      if (record.status === MaintenanceStatus.OVERDUE || (record.nextServiceDate && record.nextServiceDate < now)) {
        overdueCount += 1;
      }
    }

    return {
      totals: {
        records: records.length,
        totalCost,
        laborCost,
        partsCost,
        otherCost,
        averageCost: records.length ? totalCost / records.length : 0,
      },
      statusBreakdown: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      upcomingServiceCount,
      overdueCount,
      monthlySpend: Array.from(monthlySpend.entries()).map(([month, total]) => ({
        month,
        totalCost: total,
      })),
    };
  }

  async listUpcomingService(businessId: string, query: MaintenanceReminderQuery) {
    const now = new Date();
    const deadline = new Date(now.getTime() + (query.days ?? 30) * 24 * 60 * 60 * 1000);

    return prisma.maintenanceRecord.findMany({
      where: {
        businessId,
        vehicleId: query.vehicleId,
        nextServiceDate: {
          gte: now,
          lte: deadline,
        },
      },
      include: maintenanceInclude,
      orderBy: {
        nextServiceDate: "asc",
      },
    });
  }

  async listMileageReminders(businessId: string, query: MaintenanceReminderQuery) {
    const mileageThreshold = query.mileageThreshold ?? 500;

    return prisma.maintenanceRecord.findMany({
      where: {
        businessId,
        vehicleId: query.vehicleId,
        nextServiceMileage: {
          not: null,
        },
      },
      include: maintenanceInclude,
      orderBy: {
        nextServiceMileage: "asc",
      },
    }).then((records) =>
      records.filter((record) => {
        const nextServiceMileage = record.nextServiceMileage ?? Number.MAX_SAFE_INTEGER;
        return nextServiceMileage - record.vehicle.mileage <= mileageThreshold;
      }),
    );
  }
}

export const maintenanceRepository = new MaintenanceRepository();
