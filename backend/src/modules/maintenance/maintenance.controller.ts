import type { Request, Response } from "express";
import { maintenanceService } from "./maintenance.service.js";
import type {
  MaintenanceAnalyticsQuery,
  MaintenanceCreateInput,
  MaintenanceListQuery,
  MaintenanceReminderQuery,
  MaintenanceRouteParams,
  MaintenanceUpdateInput,
} from "./maintenance.types.js";

export class MaintenanceController {
  analytics = async (request: Request, response: Response) => {
    const analytics = await maintenanceService.getAnalytics(
      request.user!.businessId,
      request.query as unknown as MaintenanceAnalyticsQuery,
    );

    response.json({
      success: true,
      data: analytics,
    });
  };

  upcomingService = async (request: Request, response: Response) => {
    const reminders = await maintenanceService.listUpcomingService(
      request.user!.businessId,
      request.query as unknown as MaintenanceReminderQuery,
    );

    response.json({
      success: true,
      data: reminders,
    });
  };

  mileageReminders = async (request: Request, response: Response) => {
    const reminders = await maintenanceService.listMileageReminders(
      request.user!.businessId,
      request.query as unknown as MaintenanceReminderQuery,
    );

    response.json({
      success: true,
      data: reminders,
    });
  };

  list = async (request: Request, response: Response) => {
    const records = await maintenanceService.listMaintenance(
      request.user!.businessId,
      request.query as unknown as MaintenanceListQuery,
    );

    response.json({
      success: true,
      data: records,
    });
  };

  getById = async (request: Request, response: Response) => {
    const record = await maintenanceService.getMaintenanceById(
      request.user!.businessId,
      (request.params as unknown as MaintenanceRouteParams).id,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  create = async (request: Request, response: Response) => {
    const record = await maintenanceService.createMaintenance(
      request.user!.businessId,
      request.body as MaintenanceCreateInput,
    );

    response.status(201).json({
      success: true,
      data: record,
    });
  };

  update = async (request: Request, response: Response) => {
    const record = await maintenanceService.updateMaintenance(
      request.user!.businessId,
      (request.params as unknown as MaintenanceRouteParams).id,
      request.body as MaintenanceUpdateInput,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  remove = async (request: Request, response: Response) => {
    await maintenanceService.deleteMaintenance(
      request.user!.businessId,
      (request.params as unknown as MaintenanceRouteParams).id,
    );

    response.json({
      success: true,
      message: "Maintenance record deleted successfully.",
    });
  };
}

export const maintenanceController = new MaintenanceController();
