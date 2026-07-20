import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";

export class DashboardController {
  summary = async (request: Request, response: Response) => {
    const item = await dashboardService.summary(request.user!.businessId);
    response.json({ success: true, item });
  };
}

export const dashboardController = new DashboardController();
