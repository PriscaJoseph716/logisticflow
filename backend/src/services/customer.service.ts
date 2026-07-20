import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { safeTrim } from "../utils/json.js";

export class CustomerService {
  async list(businessId: string) {
    const items = await prisma.customer.findMany({
      where: { businessId },
      include: { _count: { select: { shipments: true } } },
      orderBy: { createdAt: "desc" },
    });

    return items.map(({ _count, ...item }) => ({
      ...item,
      shipmentsCount: _count.shipments,
    }));
  }

  async create(
    businessId: string,
    input: {
      customerCode: string;
      name: string;
      phone?: string | null;
      location?: string | null;
      email?: string | null;
      contactPerson?: string | null;
      notes?: string | null;
    },
  ) {
    const customerCode = safeTrim(input.customerCode);
    const name = safeTrim(input.name);
    if (!customerCode || !name) {
      throw new AppError("customerCode and name are required.");
    }

    return prisma.customer.create({
      data: {
        businessId,
        customerCode,
        name,
        phone: safeTrim(input.phone),
        location: safeTrim(input.location),
        email: safeTrim(input.email) || null,
        contactPerson: safeTrim(input.contactPerson) || null,
        notes: safeTrim(input.notes) || null,
      },
    });
  }

  async update(
    businessId: string,
    id: string,
    input: {
      customerCode?: string | null;
      name?: string | null;
      phone?: string | null;
      location?: string | null;
      email?: string | null;
      contactPerson?: string | null;
      notes?: string | null;
    },
  ) {
    const existing = await prisma.customer.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Customer not found.", 404);

    return prisma.customer.update({
      where: { id },
      data: {
        ...(input.customerCode !== undefined ? { customerCode: safeTrim(input.customerCode) } : {}),
        ...(input.name !== undefined ? { name: safeTrim(input.name) } : {}),
        ...(input.phone !== undefined ? { phone: safeTrim(input.phone) } : {}),
        ...(input.location !== undefined ? { location: safeTrim(input.location) } : {}),
        ...(input.email !== undefined ? { email: safeTrim(input.email) || null } : {}),
        ...(input.contactPerson !== undefined
          ? { contactPerson: safeTrim(input.contactPerson) || null }
          : {}),
        ...(input.notes !== undefined ? { notes: safeTrim(input.notes) || null } : {}),
      },
    });
  }

  async remove(businessId: string, id: string) {
    const existing = await prisma.customer.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Customer not found.", 404);
    await prisma.customer.delete({ where: { id } });
    return { id };
  }
}

export const customerService = new CustomerService();
