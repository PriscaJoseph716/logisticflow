import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { safeTrim } from "../utils/json.js";

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
      contact?: string | null;
      location?: string | null;
      buyingPrice?: number;
      sellingPrice?: number;
    },
  ) {
    const supplierCode = safeTrim(input.supplierCode);
    const name = safeTrim(input.name);
    if (!supplierCode || !name) {
      throw new AppError("supplierCode and name are required.");
    }

    return prisma.supplier.create({
      data: {
        businessId,
        supplierCode,
        name,
        contact: safeTrim(input.contact),
        location: safeTrim(input.location),
        buyingPrice: Number(input.buyingPrice ?? 0),
        sellingPrice: Number(input.sellingPrice ?? 0),
      },
    });
  }

  async update(
    businessId: string,
    id: string,
    input: {
      supplierCode?: string | null;
      name?: string | null;
      contact?: string | null;
      location?: string | null;
      buyingPrice?: number;
      sellingPrice?: number;
    },
  ) {
    const existing = await prisma.supplier.findFirst({ where: { id, businessId } });
    if (!existing) throw new AppError("Supplier not found.", 404);

    return prisma.supplier.update({
      where: { id },
      data: {
        ...(input.supplierCode !== undefined ? { supplierCode: safeTrim(input.supplierCode) } : {}),
        ...(input.name !== undefined ? { name: safeTrim(input.name) } : {}),
        ...(input.contact !== undefined ? { contact: safeTrim(input.contact) } : {}),
        ...(input.location !== undefined ? { location: safeTrim(input.location) } : {}),
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
