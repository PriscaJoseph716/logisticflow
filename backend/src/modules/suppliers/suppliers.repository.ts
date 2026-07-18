import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  SupplierCreateInput,
  SupplierListQuery,
  SupplierListResult,
  SupplierRecord,
  SupplierUpdateInput,
} from "./suppliers.types.js";

const supplierSelect = {
  id: true,
  businessId: true,
  supplierCode: true,
  name: true,
  contact: true,
  location: true,
  buyingPrice: true,
  sellingPrice: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      shipments: true,
    },
  },
} satisfies Prisma.SupplierSelect;

function mapSupplier(record: Prisma.SupplierGetPayload<{ select: typeof supplierSelect }>): SupplierRecord {
  return {
    id: record.id,
    businessId: record.businessId,
    supplierCode: record.supplierCode,
    name: record.name,
    contact: record.contact,
    location: record.location,
    buyingPrice: record.buyingPrice,
    sellingPrice: record.sellingPrice,
    shipmentsCount: record._count.shipments,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class SuppliersRepository {
  async list(businessId: string, query: SupplierListQuery): Promise<SupplierListResult> {
    const where = this.buildWhereInput(businessId, query);
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.SupplierOrderByWithRelationInput;

    const [items, total] = await prisma.$transaction([
      prisma.supplier.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: supplierSelect,
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      items: items.map(mapSupplier),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async findById(businessId: string, id: string): Promise<SupplierRecord | null> {
    const record = await prisma.supplier.findFirst({
      where: { id, businessId },
      select: supplierSelect,
    });

    return record ? mapSupplier(record) : null;
  }

  async create(businessId: string, input: SupplierCreateInput): Promise<SupplierRecord> {
    const record = await prisma.supplier.create({
      data: {
        businessId,
        supplierCode: input.supplierCode,
        name: input.name,
        contact: input.contact ?? null,
        location: input.location ?? null,
        buyingPrice: input.buyingPrice ?? null,
        sellingPrice: input.sellingPrice ?? null,
      },
      select: supplierSelect,
    });

    return mapSupplier(record);
  }

  async update(businessId: string, id: string, input: SupplierUpdateInput): Promise<SupplierRecord | null> {
    const existing = await prisma.supplier.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const record = await prisma.supplier.update({
      where: { id },
      data: {
        supplierCode: input.supplierCode,
        name: input.name,
        contact: input.contact,
        location: input.location,
        buyingPrice: input.buyingPrice,
        sellingPrice: input.sellingPrice,
      },
      select: supplierSelect,
    });

    return mapSupplier(record);
  }

  async remove(businessId: string, id: string): Promise<boolean> {
    const existing = await prisma.supplier.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.supplier.delete({ where: { id } });
    return true;
  }

  private buildWhereInput(businessId: string, query: SupplierListQuery): Prisma.SupplierWhereInput {
    return {
      businessId,
      location: query.location ? { contains: query.location, mode: Prisma.QueryMode.insensitive } : undefined,
      OR: query.search
        ? [
            { supplierCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { contact: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { location: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          ]
        : undefined,
    };
  }
}

export const suppliersRepository = new SuppliersRepository();
