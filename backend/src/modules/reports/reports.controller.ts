import type { Request, Response } from "express";
import { reportsService } from "./reports.service.js";
import type {
  ReportCreateInput,
  ReportExportInput,
  ReportListQuery,
  ReportRouteParams,
  ReportUpdateInput,
} from "./reports.types.js";

export class ReportsController {
  list = async (request: Request, response: Response) => {
    const records = await reportsService.listReports(
      request.user!.businessId,
      request.query as unknown as ReportListQuery,
    );

    response.json({
      success: true,
      data: records,
    });
  };

  getById = async (request: Request, response: Response) => {
    const record = await reportsService.getReportById(
      request.user!.businessId,
      (request.params as unknown as ReportRouteParams).id,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  create = async (request: Request, response: Response) => {
    const record = await reportsService.createReport(
      request.user!.businessId,
      request.body as ReportCreateInput,
    );

    response.status(201).json({
      success: true,
      data: record,
    });
  };

  update = async (request: Request, response: Response) => {
    const record = await reportsService.updateReport(
      request.user!.businessId,
      (request.params as unknown as ReportRouteParams).id,
      request.body as ReportUpdateInput,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  remove = async (request: Request, response: Response) => {
    await reportsService.deleteReport(request.user!.businessId, (request.params as unknown as ReportRouteParams).id);

    response.json({
      success: true,
      message: "Report deleted successfully.",
    });
  };

  export = async (request: Request, response: Response) => {
    const file = await reportsService.exportReports(request.user!.businessId, request.body as ReportExportInput);

    response.setHeader("Content-Type", file.mimeType);
    response.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"`);
    response.setHeader("X-Generated-At", file.generatedAt.toISOString());
    response.send(file.content);
  };
}

export const reportsController = new ReportsController();
