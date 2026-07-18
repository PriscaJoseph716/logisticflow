import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  CustomerCreateInput,
  CustomerListQuery,
  CustomerListResult,
  CustomerRecord,
  CustomerUpdateInput,
} from "./customers.types.js";

const customerSelect = {
  id: true,
  businessId: true,
  customerCode: true,
  name: true,
  email: true,
  phone: true,
  location: true,
  contactPerson: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      shipments: true,
      deliveries: true,
      invoices: true,
    },
  },
} satisfies Prisma.CustomerSelect;

function mapCustomer(record: Prisma.CustomerGetPayload<{ select: typeof customerSelect }>): CustomerRecord {
  return {
    id: record.id,
    businessId: record.businessId,
    customerCode: record.customerCode,
    name: record.name,
    email: record.email,
    phone: record.phone,
    location: record.location,
    contactPerson: record.contactPerson,
    notes: record.notes,
    shipmentsCount: record._count.shipments,
    deliveriesCount: record._count.deliveries,
    invoicesCount: record._count.invoices,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class CustomersRepository {
  async list(businessId: string, query: CustomerListQuery): Promise<CustomerListResult> {
    const where = this.buildWhereInput(businessId, query);
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.CustomerOrderByWithRelationInput;

    const [items, total] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: customerSelect,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      items: items.map(mapCustomer),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async findById(businessId: string, id: string): Promise<CustomerRecord | null> {
    const record = await prisma.customer.findFirst({
      where: { id, businessId },
      select: customerSelect,
    });

    return record ? mapCustomer(record) : null;
  }

  async create(businessId: string, input: CustomerCreateInput): Promise<CustomerRecord> {
    const record = await prisma.customer.create({
      data: {
        businessId,
        customerCode: input.customerCode,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        location: input.location ?? null,
        contactPerson: input.contactPerson ?? null,
        notes: input.notes ?? null,
      },
      select: customerSelect,
    });

    return mapCustomer(record);
  }

  async update(businessId: string, id: string, input: CustomerUpdateInput): Promise<CustomerRecord | null> {
    const existing = await prisma.customer.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    const record = await prisma.customer.update({
      where: { id },
      data: {
        customerCode: input.customerCode,
        name: input.name,
        email: input.email,
        phone: input.phone,
        location: input.location,
        contactPerson: input.contactPerson,
        notes: input.notes,
      },
      select: customerSelect,
    });

    return mapCustomer(record);
  }

  async remove(businessId: string, id: string): Promise<boolean> {
    const existing = await prisma.customer.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.customer.delete({ where: { id } });
    return true;
  }

  private buildWhereInput(businessId: string, query: CustomerListQuery): Prisma.CustomerWhereInput {
    return {
      businessId,
      location: query.location ? { contains: query.location, mode: Prisma.QueryMode.insensitive } : undefined,
      OR: query.search
        ? [
            { customerCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { location: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { contactPerson: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          ]
        : undefined,
    };
  }
}

export const customersRepository = new CustomersRepository();
