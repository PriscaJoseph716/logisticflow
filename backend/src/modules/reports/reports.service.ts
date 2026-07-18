import { AppError } from "../../utils/app-error.js";
import { reportsRepository } from "./reports.repository.js";
import type {
  ReportCreateInput,
  ReportExportInput,
  ReportListQuery,
  ReportUpdateInput,
} from "./reports.types.js";

export class ReportsService {
  async listReports(businessId: string, query: ReportListQuery) {
    return reportsRepository.list(businessId, query);
  }

  async getReportById(businessId: string, reportId: string) {
    const record = await reportsRepository.findById(businessId, reportId);

    if (!record) {
      throw new AppError("Report not found.", 404, "REPORT_NOT_FOUND");
    }

    return record;
  }

  async createReport(businessId: string, payload: ReportCreateInput) {
    return reportsRepository.create(businessId, payload);
  }

  async updateReport(businessId: string, reportId: string, payload: ReportUpdateInput) {
    const record = await reportsRepository.update(businessId, reportId, payload);

    if (!record) {
      throw new AppError("Report not found.", 404, "REPORT_NOT_FOUND");
    }

    return record;
  }

  async deleteReport(businessId: string, reportId: string) {
    const wasDeleted = await reportsRepository.remove(businessId, reportId);

    if (!wasDeleted) {
      throw new AppError("Report not found.", 404, "REPORT_NOT_FOUND");
    }
  }

  async exportReports(businessId: string, payload: ReportExportInput) {
    return reportsRepository.export(businessId, payload);
  }
}

export const reportsService = new ReportsService();
