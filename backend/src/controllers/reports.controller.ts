import type { Request, Response } from "express";
import { reportService } from "../services/report.service.js";

export class ReportsController {
  list = async (_request: Request, response: Response) => {
    const items = await reportService.list();
    response.json({ success: true, items });
  };

  export = async (request: Request, response: Response) => {
    const result = await reportService.export(request.user!.businessId, request.body ?? {});
    response.setHeader("Content-Type", result.contentType);
    response.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    response.send(result.body);
  };
}

export const reportsController = new ReportsController();
