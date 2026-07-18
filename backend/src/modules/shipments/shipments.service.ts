import { AppError } from "../../utils/app-error.js";
import { shipmentsRepository } from "./shipments.repository.js";
import type {
  ShipmentCreateInput,
  ShipmentListQuery,
  ShipmentUpdateInput,
} from "./shipments.types.js";

export class ShipmentsService {
  async listShipments(businessId: string, query: ShipmentListQuery) {
    return shipmentsRepository.list(businessId, query);
  }

  async getShipmentById(businessId: string, shipmentId: string) {
    const shipment = await shipmentsRepository.findById(businessId, shipmentId);

    if (!shipment) {
      throw new AppError("Shipment not found.", 404, "SHIPMENT_NOT_FOUND");
    }

    return shipment;
  }

  async createShipment(businessId: string, payload: ShipmentCreateInput) {
    return shipmentsRepository.create(businessId, payload);
  }

  async updateShipment(businessId: string, shipmentId: string, payload: ShipmentUpdateInput) {
    const shipment = await shipmentsRepository.update(businessId, shipmentId, payload);

    if (!shipment) {
      throw new AppError("Shipment not found.", 404, "SHIPMENT_NOT_FOUND");
    }

    return shipment;
  }

  async deleteShipment(businessId: string, shipmentId: string) {
    const wasDeleted = await shipmentsRepository.remove(businessId, shipmentId);

    if (!wasDeleted) {
      throw new AppError("Shipment not found.", 404, "SHIPMENT_NOT_FOUND");
    }
  }
}

export const shipmentsService = new ShipmentsService();
