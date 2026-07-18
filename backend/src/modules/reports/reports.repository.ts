import PDFDocument from "pdfkit";
import { ReportFormat, ReportStatus, type Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import { prisma } from "../../config/database.js";
import type {
  ReportCreateInput,
  ReportExportFile,
  ReportExportFormat,
  ReportExportInput,
  ReportListQuery,
  ReportListResult,
  ReportModule,
  ReportRecord,
  ReportSortField,
  ReportUpdateInput,
  SortOrder,
} from "./reports.types.js";

function buildOrderBy(sortBy: ReportSortField, sortOrder: SortOrder): Prisma.ReportOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

function buildMimeType(format: ReportExportFormat) {
  if (format === "pdf") {
    return "application/pdf";
  }

  if (format === "excel") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return "text/csv";
}

function slugifyFileName(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "report";
}

function buildFileName(name: string, format: ReportExportFormat) {
  return `${slugifyFileName(name)}.${format === "excel" ? "xlsx" : format}`;
}

function buildWhereClause(businessId: string, query: ReportListQuery): Prisma.ReportWhereInput {
  return {
    businessId,
    module: query.module,
    format: query.format,
    status: query.status,
    createdAt: query.createdFrom || query.createdTo
      ? {
          gte: query.createdFrom,
          lte: query.createdTo,
        }
      : undefined,
    OR: query.search
      ? [
          { name: { contains: query.search, mode: "insensitive" } },
          { module: { contains: query.search, mode: "insensitive" } },
        ]
      : undefined,
  };
}

function getFilterValue<T>(filters: Record<string, unknown> | undefined, key: string): T | undefined {
  return filters?.[key] as T | undefined;
}

async function createPdfBuffer(title: string, rows: Record<string, unknown>[]) {
  return new Promise<Buffer>((resolve, reject) => {
    const document = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    document.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.fontSize(18).text(title);
    document.moveDown();

    if (!rows.length) {
      document.fontSize(12).text("No records found for the selected filters.");
      document.end();
      return;
    }

    rows.forEach((row, index) => {
      document.fontSize(12).text(`${index + 1}.`);
      Object.entries(row).forEach(([key, value]) => {
        document.text(`${key}: ${String(value ?? "")}`);
      });
      document.moveDown();
    });

    document.end();
  });
}

function createExcelBuffer(rows: Record<string, unknown>[]) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

function createCsvBuffer(rows: Record<string, unknown>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  return Buffer.from(XLSX.utils.sheet_to_csv(worksheet), "utf-8");
}

async function buildRows(businessId: string, module: ReportModule, filters?: Record<string, unknown>) {
  switch (module) {
    case "shipments": {
      const records = await prisma.shipment.findMany({
        where: {
          businessId,
          status: getFilterValue(filters, "status"),
          deliveryStatus: getFilterValue(filters, "deliveryStatus"),
          customerId: getFilterValue(filters, "customerId"),
          vehicleId: getFilterValue(filters, "vehicleId"),
        },
        include: {
          customer: true,
          supplier: true,
          vehicle: true,
          driver: true,
        },
      });

      return records.map((record) => ({
        id: record.id,
        shipmentCode: record.shipmentCode,
        origin: record.origin,
        destination: record.destination,
        status: record.status,
        deliveryStatus: record.deliveryStatus,
        scheduledDate: record.scheduledDate?.toISOString() ?? "",
        customer: record.customer?.name ?? "",
        supplier: record.supplier?.name ?? "",
        vehicle: record.vehicle?.name ?? "",
        driver: record.driver?.fullName ?? "",
      }));
    }
    case "deliveries": {
      const records = await prisma.delivery.findMany({
        where: {
          businessId,
          status: getFilterValue(filters, "status"),
          customerId: getFilterValue(filters, "customerId"),
          vehicleId: getFilterValue(filters, "vehicleId"),
        },
        include: {
          shipment: true,
          customer: true,
          vehicle: true,
          driver: true,
        },
      });

      return records.map((record) => ({
        id: record.id,
        deliveryCode: record.deliveryCode,
        status: record.status,
        deliveredAt: record.deliveredAt?.toISOString() ?? "",
        shipmentCode: record.shipment?.shipmentCode ?? "",
        customer: record.customer?.name ?? "",
        vehicle: record.vehicle?.name ?? "",
        driver: record.driver?.fullName ?? "",
      }));
    }
    case "maintenance": {
      const records = await prisma.maintenanceRecord.findMany({
        where: {
          businessId,
          status: getFilterValue(filters, "status"),
          vehicleId: getFilterValue(filters, "vehicleId"),
        },
        include: {
          vehicle: true,
          parts: true,
          attachments: true,
        },
      });

      return records.map((record) => ({
        id: record.id,
        maintenanceType: record.maintenanceType,
        vehicle: record.vehicle.name,
        maintenanceDate: record.maintenanceDate.toISOString(),
        currentMileage: record.currentMileage,
        totalCost: record.totalCost,
        nextServiceDate: record.nextServiceDate?.toISOString() ?? "",
        nextServiceMileage: record.nextServiceMileage ?? "",
        partsCount: record.parts.length,
        attachmentsCount: record.attachments.length,
        status: record.status,
      }));
    }
    case "billing": {
      const records = await prisma.invoice.findMany({
        where: {
          businessId,
          status: getFilterValue(filters, "status"),
          customerId: getFilterValue(filters, "customerId"),
        },
        include: {
          customer: true,
          shipment: true,
        },
      });

      return records.map((record) => ({
        id: record.id,
        invoiceNumber: record.invoiceNumber,
        customer: record.customer?.name ?? "",
        shipmentCode: record.shipment?.shipmentCode ?? "",
        issueDate: record.issueDate.toISOString(),
        dueDate: record.dueDate.toISOString(),
        totalAmount: record.totalAmount,
        paidAmount: record.paidAmount,
        balanceAmount: record.balanceAmount,
        status: record.status,
      }));
    }
    case "payments": {
      const records = await prisma.payment.findMany({
        where: {
          businessId,
          status: getFilterValue(filters, "status"),
          customerId: getFilterValue(filters, "customerId"),
          invoiceId: getFilterValue(filters, "invoiceId"),
        },
        include: {
          customer: true,
          invoice: true,
        },
      });

      return records.map((record) => ({
        id: record.id,
        amount: record.amount,
        paymentDate: record.paymentDate.toISOString(),
        method: record.method,
        status: record.status,
        invoiceNumber: record.invoice?.invoiceNumber ?? "",
        customer: record.customer?.name ?? "",
        reference: record.reference ?? "",
      }));
    }
    case "reports": {
      const records = await prisma.report.findMany({
        where: {
          businessId,
          status: getFilterValue(filters, "status"),
          module: getFilterValue(filters, "module"),
        },
      });

      return records.map((record) => ({
        id: record.id,
        name: record.name,
        module: record.module,
        format: record.format,
        status: record.status,
        generatedAt: record.generatedAt?.toISOString() ?? "",
        createdAt: record.createdAt.toISOString(),
      }));
    }
  }
}

function pickColumns(rows: Record<string, unknown>[], requestedColumns?: string[]) {
  if (!requestedColumns?.length) {
    return rows;
  }

  return rows.map((row) =>
    requestedColumns.reduce<Record<string, unknown>>((accumulator, column) => {
      accumulator[column] = row[column] ?? "";
      return accumulator;
    }, {}),
  );
}

export class ReportsRepository {
  async list(businessId: string, query: ReportListQuery): Promise<ReportListResult> {
    const where = buildWhereClause(businessId, query);
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: buildOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: query.pageSize,
      }),
      prisma.report.count({ where }),
    ]);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.pageSize);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
    };
  }

  async findById(businessId: string, reportId: string): Promise<ReportRecord | null> {
    return prisma.report.findFirst({
      where: {
        id: reportId,
        businessId,
      },
    });
  }

  async create(businessId: string, payload: ReportCreateInput): Promise<ReportRecord> {
    return prisma.report.create({
      data: {
        businessId,
        name: payload.name,
        module: payload.module,
        format: payload.format,
        status: payload.status ?? ReportStatus.QUEUED,
        filtersJson: payload.filters,
        fileUrl: payload.fileUrl,
        generatedAt: payload.generatedAt,
      },
    });
  }

  async update(businessId: string, reportId: string, payload: ReportUpdateInput): Promise<ReportRecord | null> {
    const existing = await prisma.report.findFirst({
      where: {
        id: reportId,
        businessId,
      },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.report.update({
      where: { id: reportId },
      data: {
        name: payload.name,
        module: payload.module,
        format: payload.format,
        status: payload.status,
        filtersJson: payload.filters,
        fileUrl: payload.fileUrl,
        generatedAt: payload.generatedAt,
      },
    });
  }

  async remove(businessId: string, reportId: string): Promise<boolean> {
    const existing = await prisma.report.findFirst({
      where: {
        id: reportId,
        businessId,
      },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.report.delete({
      where: { id: reportId },
    });
    return true;
  }

  async export(businessId: string, payload: ReportExportInput): Promise<ReportExportFile> {
    const report = await prisma.report.create({
      data: {
        businessId,
        name: payload.name,
        module: payload.module,
        format: payload.format.toUpperCase() as ReportFormat,
        status: ReportStatus.QUEUED,
        filtersJson: payload.filters as Prisma.InputJsonValue | undefined,
      },
    });

    try {
      const rows = pickColumns(await buildRows(businessId, payload.module, payload.filters), payload.columns);
      const generatedAt = new Date();
      const content =
        payload.format === "pdf"
          ? await createPdfBuffer(payload.name, rows)
          : payload.format === "excel"
            ? createExcelBuffer(rows)
            : createCsvBuffer(rows);

      const updatedReport = await prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.GENERATED,
          generatedAt,
        },
      });

      return {
        report: updatedReport,
        fileName: buildFileName(payload.name, payload.format),
        mimeType: buildMimeType(payload.format),
        content,
        generatedAt,
      };
    } catch (error) {
      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: ReportStatus.FAILED,
        },
      });
      throw error;
    }
  }
}

export const reportsRepository = new ReportsRepository();
