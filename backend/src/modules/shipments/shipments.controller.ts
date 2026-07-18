import type { Request, Response } from "express";
import { shipmentsService } from "./shipments.service.js";
import type {
  ShipmentCreateInput,
  ShipmentListQuery,
  ShipmentRouteParams,
  ShipmentUpdateInput,
} from "./shipments.types.js";

export class ShipmentsController {
  list = async (request: Request, response: Response) => {
    const shipments = await shipmentsService.listShipments(
      request.user!.businessId,
      request.query as unknown as ShipmentListQuery,
    );

    response.json({
      success: true,
      data: shipments,
    });
  };

  getById = async (request: Request, response: Response) => {
    const shipment = await shipmentsService.getShipmentById(
      request.user!.businessId,
      (request.params as unknown as ShipmentRouteParams).id,
    );

    response.json({
      success: true,
      data: shipment,
    });
  };

  create = async (request: Request, response: Response) => {
    const shipment = await shipmentsService.createShipment(
      request.user!.businessId,
      request.body as ShipmentCreateInput,
    );

    response.status(201).json({
      success: true,
      data: shipment,
    });
  };

  update = async (request: Request, response: Response) => {
    const shipment = await shipmentsService.updateShipment(
      request.user!.businessId,
      (request.params as unknown as ShipmentRouteParams).id,
      request.body as ShipmentUpdateInput,
    );

    response.json({
      success: true,
      data: shipment,
    });
  };

  remove = async (request: Request, response: Response) => {
    await shipmentsService.deleteShipment(request.user!.businessId, (request.params as unknown as ShipmentRouteParams).id);

    response.json({
      success: true,
      message: "Shipment deleted successfully.",
    });
  };
}

export const shipmentsController = new ShipmentsController();
