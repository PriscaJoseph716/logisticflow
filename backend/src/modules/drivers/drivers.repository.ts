import { DriverStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  DriverCreateInput,
  DriverListQuery,
  DriverListResult,
  DriverRecord,
  DriverUpdateInput,
} from "./drivers.types.js";

const driverSelect = {
  id: true,
  businessId: true,
  fullName: true,
  phone: true,
  email: true,
  licenseNumber: true,
  licenseExpiry: true,
  status: true,
  address: true,
  emergencyContact: true,
  createdAt: true,
  updatedAt: true,
  vehicles: {
    select: {
      id: true,
      name: true,
      headPlateNumber: true,
      status: true,
    },
    orderBy: { updatedAt: "desc" },
  },
} satisfies Prisma.DriverSelect;

export class DriversRepository {
  async list(businessId: string, query: DriverListQuery): Promise<DriverListResult> {
    const where = this.buildWhereInput(businessId, query);
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.DriverOrderByWithRelationInput;

    const [items, total] = await prisma.$transaction([
      prisma.driver.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: driverSelect,
      }),
      prisma.driver.count({ where }),
    ]);

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async findById(businessId: string, id: string): Promise<DriverRecord | null> {
    return prisma.driver.findFirst({
      where: { id, businessId },
      select: driverSelect,
    });
  }

  async create(businessId: string, input: DriverCreateInput): Promise<DriverRecord> {
    return prisma.driver.create({
      data: {
        businessId,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email ?? null,
        licenseNumber: input.licenseNumber,
        licenseExpiry: input.licenseExpiry ?? null,
        status: input.status ?? DriverStatus.ACTIVE,
        address: input.address ?? null,
        emergencyContact: input.emergencyContact ?? null,
      },
      select: driverSelect,
    });
  }

  async update(businessId: string, id: string, input: DriverUpdateInput): Promise<DriverRecord | null> {
    const existing = await prisma.driver.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.driver.update({
      where: { id },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        licenseNumber: input.licenseNumber,
        licenseExpiry: input.licenseExpiry,
        status: input.status,
        address: input.address,
        emergencyContact: input.emergencyContact,
      },
      select: driverSelect,
    });
  }

  async remove(businessId: string, id: string): Promise<boolean> {
    const existing = await prisma.driver.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.driver.delete({ where: { id } });
    return true;
  }

  private buildWhereInput(businessId: string, query: DriverListQuery): Prisma.DriverWhereInput {
    return {
      businessId,
      status: query.status,
      licenseExpiry: query.licenseExpiryBefore ? { lte: query.licenseExpiryBefore } : undefined,
      OR: query.search
        ? [
            { fullName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { licenseNumber: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { address: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          ]
        : undefined,
    };
  }
}

export const driversRepository = new DriversRepository();
