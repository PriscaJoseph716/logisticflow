import type { Request, Response } from "express";
import { paymentService } from "../services/payment.service.js";

export class PaymentsController {
  list = async (request: Request, response: Response) => {
    const items = await paymentService.list(request.user!.businessId);
    response.json({ success: true, items });
  };

  create = async (request: Request, response: Response) => {
    const item = await paymentService.create(request.user!.businessId, request.body);
    response.status(201).json({ success: true, item });
  };

  update = async (request: Request, response: Response) => {
    const item = await paymentService.update(
      request.user!.businessId,
      request.params.id as string,
      request.body,
    );
    response.json({ success: true, item });
  };

  remove = async (request: Request, response: Response) => {
    const item = await paymentService.remove(
      request.user!.businessId,
      request.params.id as string,
    );
    response.json({ success: true, item });
  };
}

export const paymentsController = new PaymentsController();
