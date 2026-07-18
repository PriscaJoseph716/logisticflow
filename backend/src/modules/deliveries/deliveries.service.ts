import { AppError } from "../../utils/app-error.js";
import { deliveriesRepository } from "./deliveries.repository.js";
import type {
  DeliveryCreateInput,
  DeliveryListQuery,
  DeliveryUpdateInput,
} from "./deliveries.types.js";

export class DeliveriesService {
  async listDeliveries(businessId: string, query: DeliveryListQuery) {
    return deliveriesRepository.list(businessId, query);
  }

  async getDeliveryById(businessId: string, deliveryId: string) {
    const delivery = await deliveriesRepository.findById(businessId, deliveryId);

    if (!delivery) {
      throw new AppError("Delivery not found.", 404, "DELIVERY_NOT_FOUND");
    }

    return delivery;
  }

  async createDelivery(businessId: string, payload: DeliveryCreateInput) {
    return deliveriesRepository.create(businessId, payload);
  }

  async updateDelivery(businessId: string, deliveryId: string, payload: DeliveryUpdateInput) {
    const delivery = await deliveriesRepository.update(businessId, deliveryId, payload);

    if (!delivery) {
      throw new AppError("Delivery not found.", 404, "DELIVERY_NOT_FOUND");
    }

    return delivery;
  }

  async deleteDelivery(businessId: string, deliveryId: string) {
    const wasDeleted = await deliveriesRepository.remove(businessId, deliveryId);

    if (!wasDeleted) {
      throw new AppError("Delivery not found.", 404, "DELIVERY_NOT_FOUND");
    }
  }
}

export const deliveriesService = new DeliveriesService();
