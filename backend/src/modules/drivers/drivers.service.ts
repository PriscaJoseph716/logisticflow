import { AppError } from "../../utils/app-error.js";
import { driversRepository } from "./drivers.repository.js";
import type { DriverCreateInput, DriverListQuery, DriverUpdateInput } from "./drivers.types.js";

export class DriversService {
  async listDrivers(businessId: string, query: DriverListQuery) {
    return driversRepository.list(businessId, query);
  }

  async getDriversById(businessId: string, id: string) {
    const driver = await driversRepository.findById(businessId, id);

    if (!driver) {
      throw new AppError("Driver not found.", 404, "DRIVER_NOT_FOUND");
    }

    return driver;
  }

  async createDrivers(businessId: string, input: DriverCreateInput) {
    return driversRepository.create(businessId, input);
  }

  async updateDrivers(businessId: string, id: string, input: DriverUpdateInput) {
    const driver = await driversRepository.update(businessId, id, input);

    if (!driver) {
      throw new AppError("Driver not found.", 404, "DRIVER_NOT_FOUND");
    }

    return driver;
  }

  async deleteDrivers(businessId: string, id: string) {
    const removed = await driversRepository.remove(businessId, id);

    if (!removed) {
      throw new AppError("Driver not found.", 404, "DRIVER_NOT_FOUND");
    }
  }
}

export const driversService = new DriversService();
