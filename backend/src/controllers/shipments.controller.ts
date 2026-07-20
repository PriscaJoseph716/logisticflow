import type { Request, Response } from "express";
import { shipmentService } from "../services/shipment.service.js";

export class ShipmentsController {
  list = async (request: Request, response: Response) => {
    const items = await shipmentService.list(request.user!.businessId);
    response.json({ success: true, items });
  };

  create = async (request: Request, response: Response) => {
    const item = await shipmentService.create(request.user!.businessId, request.body);
    response.status(201).json({ success: true, item });
  };

  update = async (request: Request, response: Response) => {
    const item = await shipmentService.update(
      request.user!.businessId,
      request.params.id as string,
      request.body,
    );
    response.json({ success: true, item });
  };

  remove = async (request: Request, response: Response) => {
    const item = await shipmentService.remove(
      request.user!.businessId,
      request.params.id as string,
    );
    response.json({ success: true, item });
  };
}

export const shipmentsController = new ShipmentsController();
