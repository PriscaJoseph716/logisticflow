import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";

export class SupplierService {
  async list(businessId: string) {
    const items = await prisma.supplier.findMany({
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
      supplierCode: string;
      name: string;
      contact?: string;
      location?: string;
      buyingPrice?: number;
      sellingPrice?: number;
    },
  ) {
    const supplierCode = input.supplierCode?.trim();
    const name = input.name?.trim();
    if (!supplierCode || !name) {
      throw new AppError("supplierCode and name are required.");
    }

    return prisma.supplier.create({
      data: {
        businessId,
        supplierCode,
        name,
        contact: input.contact?.trim() ?? "",
        location: input.location?.trim() ?? "",
        buyingPrice: Number(input.buyingPrice ?? 0),
        sellingPrice: Number(input.sellingPrice ?? 0),
      },
    });
  }

  async update(
    businessId: string,
    id: string,
    input: {
      supplierCode?: string;
      name?: string;
      contact?: string;
      location?: string;
      buyingPrice?: number;
      sellingPrice?: number;
    },
  ) {
    const existing = await prisma.supplier.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Supplier not found.", 404);

    return prisma.supplier.update({
      where: { id },
      data: {
        ...(input.supplierCode !== undefined ? { supplierCode: input.supplierCode.trim() } : {}),
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.contact !== undefined ? { contact: input.contact.trim() } : {}),
        ...(input.location !== undefined ? { location: input.location.trim() } : {}),
        ...(input.buyingPrice !== undefined ? { buyingPrice: Number(input.buyingPrice) } : {}),
        ...(input.sellingPrice !== undefined ? { sellingPrice: Number(input.sellingPrice) } : {}),
      },
    });
  }

  async remove(businessId: string, id: string) {
    const existing = await prisma.supplier.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Supplier not found.", 404);
    await prisma.supplier.delete({ where: { id } });
    return { id };
  }
}

export const supplierService = new SupplierService();
