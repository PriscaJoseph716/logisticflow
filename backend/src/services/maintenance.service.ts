import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { safeTrim, safeUpper } from "../utils/json.js";

const maintenanceInclude = {
  vehicle: {
    include: {
      assignedDriver: {
        select: { id: true, fullName: true, email: true, phone: true, role: true },
      },
    },
  },
  parts: true,
  attachments: true,
} as const;

type PartInput = {
  partName: string;
  brand?: string | null;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  supplier?: string | null;
};

type AttachmentInput = {
  fileName: string;
  fileUrl: string;
  mimeType?: string | null;
  category?: string | null;
};

function normalizeParts(parts: PartInput[] = []) {
  return parts
    .map((part) => {
      const quantity = Number(part.quantity ?? 1);
      const unitPrice = Number(part.unitPrice ?? 0);
      const totalPrice =
        part.totalPrice !== undefined ? Number(part.totalPrice) : quantity * unitPrice;
      return {
        partName: safeTrim(part.partName),
        brand: safeTrim(part.brand),
        quantity,
        unitPrice,
        totalPrice,
        supplier: safeTrim(part.supplier),
      };
    })
    .filter((part) => Boolean(part.partName));
}

function normalizeAttachments(attachments: AttachmentInput[] = []) {
  return attachments
    .map((item) => ({
      fileName: safeTrim(item.fileName),
      fileUrl: safeTrim(item.fileUrl),
      mimeType: safeTrim(item.mimeType),
      category: safeUpper(item.category, "OTHER") || "OTHER",
    }))
    .filter((item) => Boolean(item.fileName && item.fileUrl));
}

function computeCosts(laborCost: number, otherCost: number, parts: ReturnType<typeof normalizeParts>) {
  const partsCost = parts.reduce((sum, part) => sum + part.totalPrice, 0);
  return {
    partsCost,
    totalCost: laborCost + partsCost + otherCost,
  };
}

function normalizeMaintenanceDbStatus(value: unknown) {
  const status = safeUpper(value, "PENDING") || "PENDING";
  if (status === "SCHEDULED") return "PENDING";
  return status;
}

export class MaintenanceService {
  async list(businessId: string) {
    return prisma.maintenanceRecord.findMany({
      where: { businessId },
      include: maintenanceInclude,
      orderBy: { maintenanceDate: "desc" },
    });
  }

  async analytics(businessId: string) {
    const records = await prisma.maintenanceRecord.findMany({
      where: { businessId },
      select: { status: true, totalCost: true },
    });

    const byStatus: Record<string, number> = {};
    let totalCost = 0;
    for (const record of records) {
      totalCost += record.totalCost;
      byStatus[record.status] = (byStatus[record.status] ?? 0) + 1;
    }

    return {
      count: records.length,
      totalCost,
      byStatus,
    };
  }

  async upcomingService(businessId: string) {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    return prisma.maintenanceRecord.findMany({
      where: {
        businessId,
        nextServiceDate: { gte: now, lte: in30Days },
      },
      include: maintenanceInclude,
      orderBy: { nextServiceDate: "asc" },
    });
  }

  async mileageReminders(businessId: string) {
    const records = await prisma.maintenanceRecord.findMany({
      where: {
        businessId,
        nextServiceMileage: { not: null },
      },
      include: maintenanceInclude,
      orderBy: { nextServiceMileage: "asc" },
    });

    return records.filter(
      (record) =>
        record.nextServiceMileage != null &&
        record.vehicle.mileage >= record.nextServiceMileage - 500,
    );
  }

  async create(
    businessId: string,
    input: {
      vehicleId: string;
      maintenanceDate: string;
      maintenanceType: string;
      description?: string;
      workshop?: string;
      mechanic?: string;
      currentMileage?: number;
      laborCost?: number;
      otherCost?: number;
      nextServiceDate?: string | null;
      nextServiceMileage?: number | null;
      status?: string;
      parts?: PartInput[];
      attachments?: AttachmentInput[];
    },
  ) {
    if (!input.vehicleId || !input.maintenanceDate || !safeTrim(input.maintenanceType)) {
      throw new AppError("vehicleId, maintenanceDate, and maintenanceType are required.");
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: { id: input.vehicleId, businessId },
    });
    if (!vehicle) throw new AppError("Vehicle not found.", 404);

    const parts = normalizeParts(input.parts);
    const attachments = normalizeAttachments(input.attachments);
    const laborCost = Number(input.laborCost ?? 0);
    const otherCost = Number(input.otherCost ?? 0);
    const { partsCost, totalCost } = computeCosts(laborCost, otherCost, parts);

    return prisma.maintenanceRecord.create({
      data: {
        businessId,
        vehicleId: input.vehicleId,
        maintenanceDate: new Date(input.maintenanceDate),
        maintenanceType: safeTrim(input.maintenanceType),
        description: safeTrim(input.description),
        workshop: safeTrim(input.workshop),
        mechanic: safeTrim(input.mechanic),
        currentMileage: Number(input.currentMileage ?? 0),
        laborCost,
        partsCost,
        otherCost,
        totalCost,
        nextServiceDate: input.nextServiceDate ? new Date(input.nextServiceDate) : null,
        nextServiceMileage:
          input.nextServiceMileage !== undefined && input.nextServiceMileage !== null
            ? Number(input.nextServiceMileage)
            : null,
        status: normalizeMaintenanceDbStatus(input.status),
        parts: { create: parts },
        attachments: { create: attachments },
      },
      include: maintenanceInclude,
    });
  }

  async update(
    businessId: string,
    id: string,
    input: {
      vehicleId?: string;
      maintenanceDate?: string;
      maintenanceType?: string;
      description?: string;
      workshop?: string;
      mechanic?: string;
      currentMileage?: number;
      laborCost?: number;
      otherCost?: number;
      nextServiceDate?: string | null;
      nextServiceMileage?: number | null;
      status?: string;
      parts?: PartInput[];
      attachments?: AttachmentInput[];
    },
  ) {
    const existing = await prisma.maintenanceRecord.findFirst({
      where: { id, businessId },
      include: { parts: true },
    });
    if (!existing) throw new AppError("Maintenance record not found.", 404);

    if (input.vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: input.vehicleId, businessId },
      });
      if (!vehicle) throw new AppError("Vehicle not found.", 404);
    }

    const replaceParts = input.parts !== undefined;
    const replaceAttachments = input.attachments !== undefined;
    const parts = replaceParts ? normalizeParts(input.parts) : undefined;
    const attachments = replaceAttachments
      ? normalizeAttachments(input.attachments)
      : undefined;

    const laborCost =
      input.laborCost !== undefined ? Number(input.laborCost) : existing.laborCost;
    const otherCost =
      input.otherCost !== undefined ? Number(input.otherCost) : existing.otherCost;

    let partsCost = existing.partsCost;
    if (parts) {
      partsCost = computeCosts(laborCost, otherCost, parts).partsCost;
    } else if (input.laborCost !== undefined || input.otherCost !== undefined) {
      partsCost = existing.parts.reduce((sum, part) => sum + part.totalPrice, 0);
    }
    const totalCost = laborCost + partsCost + otherCost;

    return prisma.$transaction(async (tx) => {
      if (replaceParts) {
        await tx.maintenancePart.deleteMany({ where: { maintenanceId: id } });
      }
      if (replaceAttachments) {
        await tx.maintenanceAttachment.deleteMany({ where: { maintenanceId: id } });
      }

      const updated = await tx.maintenanceRecord.update({
        where: { id },
        data: {
          ...(input.vehicleId !== undefined ? { vehicleId: input.vehicleId } : {}),
          ...(input.maintenanceDate !== undefined
            ? { maintenanceDate: new Date(input.maintenanceDate) }
            : {}),
          ...(input.maintenanceType !== undefined
            ? { maintenanceType: safeTrim(input.maintenanceType) }
            : {}),
          ...(input.description !== undefined ? { description: safeTrim(input.description) } : {}),
          ...(input.workshop !== undefined ? { workshop: safeTrim(input.workshop) } : {}),
          ...(input.mechanic !== undefined ? { mechanic: safeTrim(input.mechanic) } : {}),
          ...(input.currentMileage !== undefined
            ? { currentMileage: Number(input.currentMileage) }
            : {}),
          laborCost,
          partsCost,
          otherCost,
          totalCost,
          ...(input.nextServiceDate !== undefined
            ? {
                nextServiceDate: input.nextServiceDate
                  ? new Date(input.nextServiceDate)
                  : null,
              }
            : {}),
          ...(input.nextServiceMileage !== undefined
            ? {
                nextServiceMileage:
                  input.nextServiceMileage !== null ? Number(input.nextServiceMileage) : null,
              }
            : {}),
          ...(input.status !== undefined
            ? { status: normalizeMaintenanceDbStatus(input.status) }
            : {}),
        },
      });

      if (parts?.length) {
        await tx.maintenancePart.createMany({
          data: parts.map((part) => ({ ...part, maintenanceId: id })),
        });
      }
      if (attachments?.length) {
        await tx.maintenanceAttachment.createMany({
          data: attachments.map((item) => ({ ...item, maintenanceId: id })),
        });
      }

      return tx.maintenanceRecord.findFirst({
        where: { id: updated.id },
        include: maintenanceInclude,
      });
    });
  }

  async remove(businessId: string, id: string) {
    const existing = await prisma.maintenanceRecord.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Maintenance record not found.", 404);
    await prisma.maintenanceRecord.delete({ where: { id } });
    return { id };
  }
}

export const maintenanceService = new MaintenanceService();
