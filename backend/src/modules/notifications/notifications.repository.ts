import { NotificationStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  NotificationCreateInput,
  NotificationListQuery,
  NotificationListResult,
  NotificationRecord,
  NotificationUpdateInput,
} from "./notifications.types.js";

const notificationSelect = {
  id: true,
  businessId: true,
  type: true,
  title: true,
  message: true,
  status: true,
  relatedEntity: true,
  relatedEntityId: true,
  dueDate: true,
  metadataJson: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.NotificationSelect;

export class NotificationsRepository {
  async list(businessId: string, query: NotificationListQuery): Promise<NotificationListResult> {
    const where = this.buildWhereInput(businessId, query);
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.NotificationOrderByWithRelationInput;

    const [items, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: notificationSelect,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async findById(businessId: string, id: string): Promise<NotificationRecord | null> {
    return prisma.notification.findFirst({
      where: { id, businessId },
      select: notificationSelect,
    });
  }

  async create(businessId: string, input: NotificationCreateInput): Promise<NotificationRecord> {
    return prisma.notification.create({
      data: {
        businessId,
        type: input.type,
        title: input.title,
        message: input.message,
        status: input.status ?? NotificationStatus.UNREAD,
        relatedEntity: input.relatedEntity ?? null,
        relatedEntityId: input.relatedEntityId ?? null,
        dueDate: input.dueDate ?? null,
        metadataJson: input.metadataJson ?? Prisma.JsonNull,
      },
      select: notificationSelect,
    });
  }

  async update(businessId: string, id: string, input: NotificationUpdateInput): Promise<NotificationRecord | null> {
    const existing = await prisma.notification.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.notification.update({
      where: { id },
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        status: input.status,
        relatedEntity: input.relatedEntity,
        relatedEntityId: input.relatedEntityId,
        dueDate: input.dueDate,
        metadataJson:
          input.metadataJson === undefined
            ? undefined
            : input.metadataJson === null
              ? Prisma.JsonNull
              : input.metadataJson,
      },
      select: notificationSelect,
    });
  }

  async remove(businessId: string, id: string): Promise<boolean> {
    const existing = await prisma.notification.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.notification.delete({ where: { id } });
    return true;
  }

  private buildWhereInput(businessId: string, query: NotificationListQuery): Prisma.NotificationWhereInput {
    return {
      businessId,
      type: query.type,
      status: query.status,
      relatedEntity: query.relatedEntity
        ? { contains: query.relatedEntity, mode: Prisma.QueryMode.insensitive }
        : undefined,
      dueDate: query.dueBefore ? { lte: query.dueBefore } : undefined,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { message: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { relatedEntity: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { relatedEntityId: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          ]
        : undefined,
    };
  }
}

export const notificationsRepository = new NotificationsRepository();
