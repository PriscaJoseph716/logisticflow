import type { Request, Response } from "express";
import { supplierService } from "../services/supplier.service.js";

export class SuppliersController {
  list = async (request: Request, response: Response) => {
    const items = await supplierService.list(request.user!.businessId);
    response.json({ success: true, items });
  };

  create = async (request: Request, response: Response) => {
    const item = await supplierService.create(request.user!.businessId, request.body);
    response.status(201).json({ success: true, item });
  };

  update = async (request: Request, response: Response) => {
    const item = await supplierService.update(
      request.user!.businessId,
      request.params.id as string,
      request.body,
    );
    response.json({ success: true, item });
  };

  remove = async (request: Request, response: Response) => {
    const item = await supplierService.remove(
      request.user!.businessId,
      request.params.id as string,
    );
    response.json({ success: true, item });
  };
}

export const suppliersController = new SuppliersController();
