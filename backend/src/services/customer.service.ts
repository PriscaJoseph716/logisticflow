import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";

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
      phone?: string;
      location?: string;
      email?: string | null;
      contactPerson?: string | null;
      notes?: string | null;
    },
  ) {
    const customerCode = input.customerCode?.trim();
    const name = input.name?.trim();
    if (!customerCode || !name) {
      throw new AppError("customerCode and name are required.");
    }

    return prisma.customer.create({
      data: {
        businessId,
        customerCode,
        name,
        phone: input.phone?.trim() ?? "",
        location: input.location?.trim() ?? "",
        email: input.email?.trim() || null,
        contactPerson: input.contactPerson?.trim() || null,
        notes: input.notes?.trim() || null,
      },
    });
  }

  async update(
    businessId: string,
    id: string,
    input: {
      customerCode?: string;
      name?: string;
      phone?: string;
      location?: string;
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
        ...(input.customerCode !== undefined ? { customerCode: input.customerCode.trim() } : {}),
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
        ...(input.location !== undefined ? { location: input.location.trim() } : {}),
        ...(input.email !== undefined ? { email: input.email?.trim() || null } : {}),
        ...(input.contactPerson !== undefined
          ? { contactPerson: input.contactPerson?.trim() || null }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
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
