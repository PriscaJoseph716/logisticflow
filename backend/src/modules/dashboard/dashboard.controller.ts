import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service.js";
import type {
  CreateDashboardWidgetInput,
  DashboardWidgetRouteParams,
  DashboardWidgetsListQuery,
  UpdateDashboardWidgetInput,
} from "./dashboard.types.js";

export class DashboardController {
  summary = async (request: Request, response: Response) => {
    const data = await dashboardService.getSummary(request.user!.businessId);
    response.json({ success: true, data });
  };

  listWidgets = async (request: Request, response: Response) => {
    const data = await dashboardService.listWidgets(
      request.user!.businessId,
      request.query as unknown as DashboardWidgetsListQuery,
    );

    response.json({ success: true, data });
  };

  getWidgetById = async (request: Request, response: Response) => {
    const data = await dashboardService.getWidgetById(
      request.user!.businessId,
      (request.params as unknown as DashboardWidgetRouteParams).id,
    );

    response.json({ success: true, data });
  };

  createWidget = async (request: Request, response: Response) => {
    const data = await dashboardService.createWidget(
      request.user!.businessId,
      request.body as CreateDashboardWidgetInput,
    );

    response.status(201).json({ success: true, data });
  };

  updateWidget = async (request: Request, response: Response) => {
    const data = await dashboardService.updateWidget(
      request.user!.businessId,
      (request.params as unknown as DashboardWidgetRouteParams).id,
      request.body as UpdateDashboardWidgetInput,
    );

    response.json({ success: true, data });
  };

  removeWidget = async (request: Request, response: Response) => {
    await dashboardService.removeWidget(
      request.user!.businessId,
      (request.params as unknown as DashboardWidgetRouteParams).id,
    );

    response.status(204).send();
  };
}

export const dashboardController = new DashboardController();
