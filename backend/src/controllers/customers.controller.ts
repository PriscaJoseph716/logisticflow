import type { Request, Response } from "express";
import { customerService } from "../services/customer.service.js";

export class CustomersController {
  list = async (request: Request, response: Response) => {
    const items = await customerService.list(request.user!.businessId);
    response.json({ success: true, items });
  };

  create = async (request: Request, response: Response) => {
    const item = await customerService.create(request.user!.businessId, request.body);
    response.status(201).json({ success: true, item });
  };

  update = async (request: Request, response: Response) => {
    const item = await customerService.update(
      request.user!.businessId,
      request.params.id as string,
      request.body,
    );
    response.json({ success: true, item });
  };

  remove = async (request: Request, response: Response) => {
    const item = await customerService.remove(
      request.user!.businessId,
      request.params.id as string,
    );
    response.json({ success: true, item });
  };
}

export const customersController = new CustomersController();
