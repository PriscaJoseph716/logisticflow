import { AppError } from "../../utils/app-error.js";
import { dashboardRepository } from "./dashboard.repository.js";
import type {
  CreateDashboardWidgetInput,
  DashboardWidgetsListQuery,
  UpdateDashboardWidgetInput,
} from "./dashboard.types.js";

export class DashboardService {
  async getSummary(businessId: string) {
    return dashboardRepository.getSummary(businessId);
  }

  async listWidgets(businessId: string, query: DashboardWidgetsListQuery) {
    return dashboardRepository.listWidgets(businessId, query);
  }

  async getWidgetById(businessId: string, id: string) {
    const widget = await dashboardRepository.findWidgetById(businessId, id);

    if (!widget) {
      throw new AppError("Dashboard widget not found.", 404, "DASHBOARD_WIDGET_NOT_FOUND");
    }

    return widget;
  }

  async createWidget(businessId: string, input: CreateDashboardWidgetInput) {
    return dashboardRepository.createWidget(businessId, input);
  }

  async updateWidget(businessId: string, id: string, input: UpdateDashboardWidgetInput) {
    const widget = await dashboardRepository.updateWidget(businessId, id, input);

    if (!widget) {
      throw new AppError("Dashboard widget not found.", 404, "DASHBOARD_WIDGET_NOT_FOUND");
    }

    return widget;
  }

  async removeWidget(businessId: string, id: string) {
    const removed = await dashboardRepository.removeWidget(businessId, id);

    if (!removed) {
      throw new AppError("Dashboard widget not found.", 404, "DASHBOARD_WIDGET_NOT_FOUND");
    }
  }
}

export const dashboardService = new DashboardService();
