import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";

export class ReportService {
  async list() {
    return [] as unknown[];
  }

  async export(
    businessId: string,
    input: { name?: string; format?: string },
  ): Promise<{ contentType: string; filename: string; body: string }> {
    const format = (input.format ?? "csv").trim().toLowerCase();
    const name = (input.name?.trim() || "shipments-export").replace(/[^a-zA-Z0-9._-]/g, "_");

    const shipments = await prisma.shipment.findMany({
      where: { businessId },
      select: { shipmentCode: true, status: true, origin: true, destination: true },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv" || format === "excel") {
      const header = "shipmentCode,status,origin,destination";
      const rows = shipments.map(
        (item) =>
          `"${item.shipmentCode}","${item.status}","${item.origin.replace(/"/g, '""')}","${item.destination.replace(/"/g, '""')}"`,
      );
      const body = [header, ...rows].join("\n");
      return {
        contentType: "text/csv; charset=utf-8",
        filename: `${name}.csv`,
        body,
      };
    }

    if (format === "json") {
      return {
        contentType: "application/json; charset=utf-8",
        filename: `${name}.json`,
        body: JSON.stringify({ success: true, items: shipments }, null, 2),
      };
    }

    throw new AppError("Unsupported export format. Use csv, excel, or json.");
  }
}

export const reportService = new ReportService();
