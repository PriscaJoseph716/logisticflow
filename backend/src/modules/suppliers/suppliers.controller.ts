import type { Request, Response } from "express";
import { suppliersService } from "./suppliers.service.js";
import type {
  SupplierCreateInput,
  SupplierListQuery,
  SupplierRouteParams,
  SupplierUpdateInput,
} from "./suppliers.types.js";

export class SuppliersController {
  list = async (request: Request, response: Response) => {
    const data = await suppliersService.listSuppliers(
      request.user!.businessId,
      request.query as unknown as SupplierListQuery,
    );

    response.json({ success: true, data });
  };

  getById = async (request: Request, response: Response) => {
    const data = await suppliersService.getSuppliersById(
      request.user!.businessId,
      (request.params as unknown as SupplierRouteParams).id,
    );

    response.json({ success: true, data });
  };

  create = async (request: Request, response: Response) => {
    const data = await suppliersService.createSuppliers(
      request.user!.businessId,
      request.body as SupplierCreateInput,
    );

    response.status(201).json({ success: true, data });
  };

  update = async (request: Request, response: Response) => {
    const data = await suppliersService.updateSuppliers(
      request.user!.businessId,
      (request.params as unknown as SupplierRouteParams).id,
      request.body as SupplierUpdateInput,
    );

    response.json({ success: true, data });
  };

  remove = async (request: Request, response: Response) => {
    await suppliersService.deleteSuppliers(
      request.user!.businessId,
      (request.params as unknown as SupplierRouteParams).id,
    );

    response.status(204).send();
  };
}

export const suppliersController = new SuppliersController();
