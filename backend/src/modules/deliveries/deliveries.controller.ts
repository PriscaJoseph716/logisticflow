import type { Request, Response } from "express";
import { deliveriesService } from "./deliveries.service.js";
import type {
  DeliveryCreateInput,
  DeliveryListQuery,
  DeliveryRouteParams,
  DeliveryUpdateInput,
} from "./deliveries.types.js";

export class DeliveriesController {
  list = async (request: Request, response: Response) => {
    const deliveries = await deliveriesService.listDeliveries(
      request.user!.businessId,
      request.query as unknown as DeliveryListQuery,
    );

    response.json({
      success: true,
      data: deliveries,
    });
  };

  getById = async (request: Request, response: Response) => {
    const delivery = await deliveriesService.getDeliveryById(
      request.user!.businessId,
      (request.params as unknown as DeliveryRouteParams).id,
    );

    response.json({
      success: true,
      data: delivery,
    });
  };

  create = async (request: Request, response: Response) => {
    const delivery = await deliveriesService.createDelivery(
      request.user!.businessId,
      request.body as DeliveryCreateInput,
    );

    response.status(201).json({
      success: true,
      data: delivery,
    });
  };

  update = async (request: Request, response: Response) => {
    const delivery = await deliveriesService.updateDelivery(
      request.user!.businessId,
      (request.params as unknown as DeliveryRouteParams).id,
      request.body as DeliveryUpdateInput,
    );

    response.json({
      success: true,
      data: delivery,
    });
  };

  remove = async (request: Request, response: Response) => {
    await deliveriesService.deleteDelivery(request.user!.businessId, (request.params as unknown as DeliveryRouteParams).id);

    response.json({
      success: true,
      message: "Delivery deleted successfully.",
    });
  };
}

export const deliveriesController = new DeliveriesController();
