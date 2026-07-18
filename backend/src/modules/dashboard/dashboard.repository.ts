import { DashboardWidgetStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type {
  CreateDashboardWidgetInput,
  DashboardSummary,
  DashboardSummaryTrendPoint,
  DashboardWidgetRecord,
  DashboardWidgetsListQuery,
  DashboardWidgetsListResult,
  UpdateDashboardWidgetInput,
} from "./dashboard.types.js";

const widgetSelect = {
  id: true,
  businessId: true,
  title: true,
  widgetType: true,
  status: true,
  position: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DashboardWidgetSelect;

export class DashboardRepository {
  async getSummary(businessId: string): Promise<DashboardSummary> {
    const { startOfToday, startOfTomorrow, trendStart } = this.getDateRanges();

    const [
      todayRevenueAggregate,
      todayDeliveries,
      vehicles,
      drivers,
      customers,
      maintenanceDue,
      outstandingPaymentsAggregate,
      revenueTrendRows,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          businessId,
          status: "COMPLETED",
          paymentDate: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
        _sum: { amount: true },
      }),
      prisma.delivery.count({
        where: {
          businessId,
          status: "COMPLETED",
          deliveredAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },
        },
      }),
      prisma.vehicle.count({ where: { businessId } }),
      prisma.driver.count({ where: { businessId } }),
      prisma.customer.count({ where: { businessId } }),
      prisma.maintenanceRecord.count({
        where: {
          businessId,
          status: { in: ["SCHEDULED", "IN_PROGRESS", "OVERDUE"] },
          OR: [
            { nextServiceDate: { lte: startOfTomorrow } },
            { status: "OVERDUE" },
          ],
        },
      }),
      prisma.invoice.aggregate({
        where: {
          businessId,
          status: { notIn: ["PAID", "CANCELLED"] },
        },
        _sum: { balanceAmount: true },
      }),
      prisma.payment.findMany({
        where: {
          businessId,
          status: "COMPLETED",
          paymentDate: { gte: trendStart, lt: startOfTomorrow },
        },
        select: {
          paymentDate: true,
          amount: true,
        },
        orderBy: { paymentDate: "asc" },
      }),
    ]);

    return {
      todayRevenue: todayRevenueAggregate._sum.amount ?? 0,
      todayDeliveries,
      vehicles,
      drivers,
      customers,
      maintenanceDue,
      outstandingPayments: outstandingPaymentsAggregate._sum.balanceAmount ?? 0,
      revenueTrend: this.buildRevenueTrend(revenueTrendRows, trendStart),
    };
  }

  async listWidgets(businessId: string, query: DashboardWidgetsListQuery): Promise<DashboardWidgetsListResult> {
    const where = this.buildWidgetWhereInput(businessId, query);
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.DashboardWidgetOrderByWithRelationInput;

    const [items, total] = await prisma.$transaction([
      prisma.dashboardWidget.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: widgetSelect,
      }),
      prisma.dashboardWidget.count({ where }),
    ]);

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async findWidgetById(businessId: string, id: string): Promise<DashboardWidgetRecord | null> {
    return prisma.dashboardWidget.findFirst({
      where: { id, businessId },
      select: widgetSelect,
    });
  }

  async createWidget(businessId: string, input: CreateDashboardWidgetInput): Promise<DashboardWidgetRecord> {
    return prisma.dashboardWidget.create({
      data: {
        businessId,
        title: input.title,
        widgetType: input.widgetType,
        status: input.status ?? DashboardWidgetStatus.ACTIVE,
        position: input.position ?? 0,
        description: input.description ?? null,
      },
      select: widgetSelect,
    });
  }

  async updateWidget(
    businessId: string,
    id: string,
    input: UpdateDashboardWidgetInput,
  ): Promise<DashboardWidgetRecord | null> {
    const existing = await prisma.dashboardWidget.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.dashboardWidget.update({
      where: { id },
      data: {
        title: input.title,
        widgetType: input.widgetType,
        status: input.status,
        position: input.position,
        description: input.description,
      },
      select: widgetSelect,
    });
  }

  async removeWidget(businessId: string, id: string): Promise<boolean> {
    const existing = await prisma.dashboardWidget.findFirst({
      where: { id, businessId },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.dashboardWidget.delete({ where: { id } });
    return true;
  }

  private buildWidgetWhereInput(
    businessId: string,
    query: DashboardWidgetsListQuery,
  ): Prisma.DashboardWidgetWhereInput {
    return {
      businessId,
      status: query.status,
      widgetType: query.widgetType,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          ]
        : undefined,
    };
  }

  private getDateRanges() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const trendStart = new Date(startOfToday);
    trendStart.setDate(trendStart.getDate() - 6);

    return { startOfToday, startOfTomorrow, trendStart };
  }

  private buildRevenueTrend(
    rows: Array<{ paymentDate: Date; amount: number }>,
    trendStart: Date,
  ): DashboardSummaryTrendPoint[] {
    const buckets = new Map<string, number>();

    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(trendStart);
      date.setDate(trendStart.getDate() + offset);
      buckets.set(this.toDateKey(date), 0);
    }

    for (const row of rows) {
      const key = this.toDateKey(row.paymentDate);
      buckets.set(key, (buckets.get(key) ?? 0) + row.amount);
    }

    return [...buckets.entries()].map(([date, amount]) => ({ date, amount }));
  }

  private toDateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}

export const dashboardRepository = new DashboardRepository();
