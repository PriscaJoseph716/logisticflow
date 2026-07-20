import type { Request, Response } from "express";
import { maintenanceService } from "../services/maintenance.service.js";

export class MaintenanceController {
  list = async (request: Request, response: Response) => {
    const items = await maintenanceService.list(request.user!.businessId);
    response.json({ success: true, items });
  };

  analytics = async (request: Request, response: Response) => {
    const item = await maintenanceService.analytics(request.user!.businessId);
    response.json({ success: true, item });
  };

  upcomingService = async (request: Request, response: Response) => {
    const items = await maintenanceService.upcomingService(request.user!.businessId);
    response.json({ success: true, items });
  };

  mileageReminders = async (request: Request, response: Response) => {
    const items = await maintenanceService.mileageReminders(request.user!.businessId);
    response.json({ success: true, items });
  };

  create = async (request: Request, response: Response) => {
    const item = await maintenanceService.create(request.user!.businessId, request.body);
    response.status(201).json({ success: true, item });
  };

  update = async (request: Request, response: Response) => {
    const item = await maintenanceService.update(
      request.user!.businessId,
      request.params.id as string,
      request.body,
    );
    response.json({ success: true, item });
  };

  remove = async (request: Request, response: Response) => {
    const item = await maintenanceService.remove(
      request.user!.businessId,
      request.params.id as string,
    );
    response.json({ success: true, item });
  };
}

export const maintenanceController = new MaintenanceController();
