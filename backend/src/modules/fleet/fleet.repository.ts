import { Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  FleetCreateInput,
  FleetListQuery,
  FleetListResult,
  FleetRecord,
  FleetUpdateInput,
} from "./fleet.types.js";

const vehicleSelect = {
  id: true,
  businessId: true,
  name: true,
  headPlateNumber: true,
  trailerPlateNumber: true,
  vehicleType: true,
  category: true,
  status: true,
  insuranceExpiry: true,
  licenseExpiry: true,
  documentsJson: true,
  mileage: true,
  fuelLevel: true,
  fuelType: true,
  assignedDriverId: true,
  createdAt: true,
  updatedAt: true,
  assignedDriver: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
    },
  },
} satisfies Prisma.VehicleSelect;

export class FleetRepository {
  async list(businessId: string, query: FleetListQuery): Promise<FleetListResult> {
    const where = this.buildWhereInput(businessId, query);
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.VehicleOrderByWithRelationInput;

    const [items, total] = await prisma.$transaction([
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: vehicleSelect,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async findById(businessId: string, id: string): Promise<FleetRecord | null> {
    return prisma.vehicle.findFirst({
      where: { id, businessId },
      select: vehicleSelect,
    });
  }

  async create(businessId: string, input: FleetCreateInput): Promise<FleetRecord> {
    await this.ensureAssignedDriver(businessId, input.assignedDriverId);

    return prisma.vehicle.create({
      data: {
        businessId,
        name: input.name,
        headPlateNumber: input.headPlateNumber,
        trailerPlateNumber: input.trailerPlateNumber ?? null,
        vehicleType: input.vehicleType,
        category: input.category ?? null,
        status: input.status ?? VehicleStatus.ACTIVE,
        insuranceExpiry: input.insuranceExpiry ?? null,
        licenseExpiry: input.licenseExpiry ?? null,
        documentsJson: input.documentsJson ?? Prisma.JsonNull,
        mileage: input.mileage ?? 0,
        fuelLevel: input.fuelLevel ?? 0,
        fuelType: input.fuelType ?? null,
        assignedDriverId: input.assignedDriverId ?? null,
      },
      select: vehicleSelect,
    });
  }

  async update(businessId: string, id: string, input: FleetUpdateInput): Promise<FleetRecord | null> {
    const existing = await prisma.vehicle.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(input, "assignedDriverId")) {
      await this.ensureAssignedDriver(businessId, input.assignedDriverId);
    }

    return prisma.vehicle.update({
      where: { id },
      data: {
        name: input.name,
        headPlateNumber: input.headPlateNumber,
        trailerPlateNumber: input.trailerPlateNumber,
        vehicleType: input.vehicleType,
        category: input.category,
        status: input.status,
        insuranceExpiry: input.insuranceExpiry,
        licenseExpiry: input.licenseExpiry,
        documentsJson:
          input.documentsJson === undefined
            ? undefined
            : input.documentsJson === null
              ? Prisma.JsonNull
              : input.documentsJson,
        mileage: input.mileage,
        fuelLevel: input.fuelLevel,
        fuelType: input.fuelType,
        assignedDriverId: input.assignedDriverId,
      },
      select: vehicleSelect,
    });
  }

  async remove(businessId: string, id: string): Promise<boolean> {
    const existing = await prisma.vehicle.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.vehicle.delete({ where: { id } });
    return true;
  }

  private buildWhereInput(businessId: string, query: FleetListQuery): Prisma.VehicleWhereInput {
    return {
      businessId,
      status: query.status,
      assignedDriverId: query.assignedDriverId,
      vehicleType: query.vehicleType ? { contains: query.vehicleType, mode: Prisma.QueryMode.insensitive } : undefined,
      category: query.category ? { contains: query.category, mode: Prisma.QueryMode.insensitive } : undefined,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { headPlateNumber: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { trailerPlateNumber: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { vehicleType: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { category: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { fuelType: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { assignedDriver: { is: { fullName: { contains: query.search, mode: Prisma.QueryMode.insensitive } } } },
          ]
        : undefined,
    };
  }

  private async ensureAssignedDriver(businessId: string, assignedDriverId?: string | null) {
    if (!assignedDriverId) {
      return;
    }

    const driver = await prisma.driver.findFirst({
      where: { id: assignedDriverId, businessId },
      select: { id: true },
    });

    if (!driver) {
      throw new Error("Assigned driver not found for this business.");
    }
  }
}

export const fleetRepository = new FleetRepository();
