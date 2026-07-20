import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { parseJson, safeTrim, safeUpper, toJsonString } from "../utils/json.js";

const driverSelect = { id: true, fullName: true, email: true, phone: true, role: true } as const;

function serializeVehicle<T extends { documentsJson: string }>(vehicle: T) {
  return {
    ...vehicle,
    documentsJson: parseJson(vehicle.documentsJson, {}),
  };
}

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return new Date(String(value));
}

export class FleetService {
  async list(businessId: string) {
    const items = await prisma.vehicle.findMany({
      where: { businessId },
      include: { assignedDriver: { select: driverSelect } },
      orderBy: { createdAt: "desc" },
    });
    return items.map(serializeVehicle);
  }

  async create(
    businessId: string,
    input: {
      name?: string | null;
      headPlateNumber: string;
      trailerPlateNumber?: string | null;
      category?: string | null;
      status?: string | null;
      mileage?: number;
      fuelLevel?: number;
      fuelType?: string | null;
      vehicleType?: string | null;
      insuranceExpiry?: string | null;
      licenseExpiry?: string | null;
      documentsJson?: unknown;
      assignedDriverId?: string | null;
    },
  ) {
    const headPlateNumber = safeTrim(input.headPlateNumber);
    if (!headPlateNumber) {
      throw new AppError("headPlateNumber is required.");
    }

    if (input.assignedDriverId) {
      await this.assertDriver(businessId, input.assignedDriverId);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        businessId,
        name: safeTrim(input.name),
        headPlateNumber,
        trailerPlateNumber: safeTrim(input.trailerPlateNumber) || null,
        category: safeTrim(input.category, "owned") || "owned",
        status: safeUpper(input.status, "ACTIVE") || "ACTIVE",
        mileage: Number(input.mileage ?? 0),
        fuelLevel: Number(input.fuelLevel ?? 100),
        fuelType: safeTrim(input.fuelType),
        vehicleType: safeTrim(input.vehicleType, "truck") || "truck",
        insuranceExpiry: parseOptionalDate(input.insuranceExpiry) ?? null,
        licenseExpiry: parseOptionalDate(input.licenseExpiry) ?? null,
        documentsJson: toJsonString(input.documentsJson ?? {}),
        assignedDriverId: input.assignedDriverId || null,
      },
      include: { assignedDriver: { select: driverSelect } },
    });

    return serializeVehicle(vehicle);
  }

  async update(
    businessId: string,
    id: string,
    input: {
      name?: string | null;
      headPlateNumber?: string | null;
      trailerPlateNumber?: string | null;
      category?: string | null;
      status?: string | null;
      mileage?: number;
      fuelLevel?: number;
      fuelType?: string | null;
      vehicleType?: string | null;
      insuranceExpiry?: string | null;
      licenseExpiry?: string | null;
      documentsJson?: unknown;
      assignedDriverId?: string | null;
    },
  ) {
    const existing = await prisma.vehicle.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Vehicle not found.", 404);

    if (input.assignedDriverId) {
      await this.assertDriver(businessId, input.assignedDriverId);
    }

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: safeTrim(input.name) } : {}),
        ...(input.headPlateNumber !== undefined
          ? { headPlateNumber: safeTrim(input.headPlateNumber) }
          : {}),
        ...(input.trailerPlateNumber !== undefined
          ? { trailerPlateNumber: safeTrim(input.trailerPlateNumber) || null }
          : {}),
        ...(input.category !== undefined
          ? { category: safeTrim(input.category, "owned") || "owned" }
          : {}),
        ...(input.status !== undefined
          ? { status: safeUpper(input.status, "ACTIVE") || "ACTIVE" }
          : {}),
        ...(input.mileage !== undefined ? { mileage: Number(input.mileage) } : {}),
        ...(input.fuelLevel !== undefined ? { fuelLevel: Number(input.fuelLevel) } : {}),
        ...(input.fuelType !== undefined ? { fuelType: safeTrim(input.fuelType) } : {}),
        ...(input.vehicleType !== undefined
          ? { vehicleType: safeTrim(input.vehicleType, "truck") || "truck" }
          : {}),
        ...(input.insuranceExpiry !== undefined
          ? { insuranceExpiry: parseOptionalDate(input.insuranceExpiry) ?? null }
          : {}),
        ...(input.licenseExpiry !== undefined
          ? { licenseExpiry: parseOptionalDate(input.licenseExpiry) ?? null }
          : {}),
        ...(input.documentsJson !== undefined
          ? { documentsJson: toJsonString(input.documentsJson) }
          : {}),
        ...(input.assignedDriverId !== undefined
          ? { assignedDriverId: input.assignedDriverId || null }
          : {}),
      },
      include: { assignedDriver: { select: driverSelect } },
    });

    return serializeVehicle(vehicle);
  }

  async remove(businessId: string, id: string) {
    const existing = await prisma.vehicle.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Vehicle not found.", 404);
    await prisma.vehicle.delete({ where: { id } });
    return { id };
  }

  private async assertDriver(businessId: string, driverId: string) {
    const driver = await prisma.user.findFirst({ where: { id: driverId, businessId } });
    if (!driver) throw new AppError("Assigned driver not found.", 404);
  }
}

export const fleetService = new FleetService();
