import { AppError } from "../../utils/app-error.js";
import { maintenanceRepository } from "./maintenance.repository.js";
import type {
  MaintenanceAnalyticsQuery,
  MaintenanceCreateInput,
  MaintenanceListQuery,
  MaintenanceReminderQuery,
  MaintenanceUpdateInput,
} from "./maintenance.types.js";

export class MaintenanceService {
  async listMaintenance(businessId: string, query: MaintenanceListQuery) {
    return maintenanceRepository.list(businessId, query);
  }

  async getAnalytics(businessId: string, query: MaintenanceAnalyticsQuery) {
    return maintenanceRepository.getAnalytics(businessId, query);
  }

  async listUpcomingService(businessId: string, query: MaintenanceReminderQuery) {
    return maintenanceRepository.listUpcomingService(businessId, query);
  }

  async listMileageReminders(businessId: string, query: MaintenanceReminderQuery) {
    return maintenanceRepository.listMileageReminders(businessId, query);
  }

  async getMaintenanceById(businessId: string, maintenanceId: string) {
    const record = await maintenanceRepository.findById(businessId, maintenanceId);

    if (!record) {
      throw new AppError("Maintenance record not found.", 404, "MAINTENANCE_NOT_FOUND");
    }

    return record;
  }

  async createMaintenance(businessId: string, payload: MaintenanceCreateInput) {
    return maintenanceRepository.create(businessId, payload);
  }

  async updateMaintenance(businessId: string, maintenanceId: string, payload: MaintenanceUpdateInput) {
    const record = await maintenanceRepository.update(businessId, maintenanceId, payload);

    if (!record) {
      throw new AppError("Maintenance record not found.", 404, "MAINTENANCE_NOT_FOUND");
    }

    return record;
  }

  async deleteMaintenance(businessId: string, maintenanceId: string) {
    const wasDeleted = await maintenanceRepository.remove(businessId, maintenanceId);

    if (!wasDeleted) {
      throw new AppError("Maintenance record not found.", 404, "MAINTENANCE_NOT_FOUND");
    }
  }
}

export const maintenanceService = new MaintenanceService();
