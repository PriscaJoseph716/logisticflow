import type { Request, Response } from "express";
import { deliveryService } from "../services/delivery.service.js";

export class DeliveriesController {
  list = async (request: Request, response: Response) => {
    const items = await deliveryService.list(request.user!.businessId);
    response.json({ success: true, items });
  };
}

export const deliveriesController = new DeliveriesController();
