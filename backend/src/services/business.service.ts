import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { formatBusinessId } from "../utils/business-id.js";

type DbClient = Prisma.TransactionClient | typeof prisma;

export class BusinessService {
  async findById(id: string) {
    return prisma.business.findUnique({ where: { id } });
  }

  async findByBusinessId(businessId: string) {
    return prisma.business.findUnique({ where: { businessId } });
  }

  async getNextBusinessId(client: DbClient = prisma): Promise<string> {
    const rows = await client.$queryRaw<Array<{ max: number | null }>>`
      SELECT MAX(CAST(SUBSTRING("businessId" FROM 5) AS INTEGER)) AS max
      FROM "Business"
      WHERE "businessId" ~ '^LOG-[0-9]+$'
    `;

    const nextSequence = Number(rows[0]?.max ?? 0) + 1;
    return formatBusinessId(nextSequence);
  }
}

export const businessService = new BusinessService();
