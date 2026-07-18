import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

interface AuditActionInput {
  businessId: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
}

function toNullableJsonValue(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export class AuditService {
  async logAction(input: AuditActionInput) {
    await prisma.$transaction([
      prisma.activityLog.create({
        data: {
          businessId: input.businessId,
          userId: input.userId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          metadata: toNullableJsonValue(input.metadata),
        },
      }),
      prisma.auditLog.create({
        data: {
          businessId: input.businessId,
          userId: input.userId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          beforeJson: toNullableJsonValue(input.before),
          afterJson: toNullableJsonValue(input.after),
        },
      }),
    ]);
  }
}

export const auditService = new AuditService();
