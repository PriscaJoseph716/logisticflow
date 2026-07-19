import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { formatBusinessId } from "../utils/business-id.js";

type DbClient = Prisma.TransactionClient | typeof prisma;

function sequenceFromBusinessId(businessId: string): number {
  const match = /^LOG-(\d+)$/i.exec(businessId.trim());
  return match ? Number(match[1]) : 0;
}

export class BusinessService {
  async findById(id: string) {
    return prisma.business.findUnique({ where: { id } });
  }

  async findByBusinessId(businessId: string) {
    return prisma.business.findUnique({ where: { businessId } });
  }

  async getNextBusinessId(client: DbClient = prisma): Promise<string> {
    const businesses = await client.business.findMany({
      select: { businessId: true },
    });

    const nextSequence =
      businesses.reduce((max, item) => Math.max(max, sequenceFromBusinessId(item.businessId)), 0) + 1;

    return formatBusinessId(nextSequence);
  }
}

export const businessService = new BusinessService();
