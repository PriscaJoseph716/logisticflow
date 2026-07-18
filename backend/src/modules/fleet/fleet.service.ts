import { AppError } from "../../utils/app-error.js";
import { fleetRepository } from "./fleet.repository.js";
import type { FleetCreateInput, FleetListQuery, FleetUpdateInput } from "./fleet.types.js";

export class FleetService {
  async listFleet(businessId: string, query: FleetListQuery) {
    return fleetRepository.list(businessId, query);
  }

  async getFleetById(businessId: string, id: string) {
    const vehicle = await fleetRepository.findById(businessId, id);

    if (!vehicle) {
      throw new AppError("Vehicle not found.", 404, "FLEET_NOT_FOUND");
    }

    return vehicle;
  }

  async createFleet(businessId: string, input: FleetCreateInput) {
    try {
      return await fleetRepository.create(businessId, input);
    } catch (error) {
      throw this.mapRepositoryError(error);
    }
  }

  async updateFleet(businessId: string, id: string, input: FleetUpdateInput) {
    try {
      const vehicle = await fleetRepository.update(businessId, id, input);

      if (!vehicle) {
        throw new AppError("Vehicle not found.", 404, "FLEET_NOT_FOUND");
      }

      return vehicle;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw this.mapRepositoryError(error);
    }
  }

  async deleteFleet(businessId: string, id: string) {
    const removed = await fleetRepository.remove(businessId, id);

    if (!removed) {
      throw new AppError("Vehicle not found.", 404, "FLEET_NOT_FOUND");
    }
  }

  private mapRepositoryError(error: unknown) {
    if (error instanceof Error && error.message === "Assigned driver not found for this business.") {
      return new AppError(error.message, 400, "INVALID_ASSIGNED_DRIVER");
    }

    return error;
  }
}

export const fleetService = new FleetService();
