import type { Request, Response } from "express";
import { customersService } from "./customers.service.js";
import type {
  CustomerCreateInput,
  CustomerListQuery,
  CustomerRouteParams,
  CustomerUpdateInput,
} from "./customers.types.js";

export class CustomersController {
  list = async (request: Request, response: Response) => {
    const data = await customersService.listCustomers(
      request.user!.businessId,
      request.query as unknown as CustomerListQuery,
    );

    response.json({ success: true, data });
  };

  getById = async (request: Request, response: Response) => {
    const data = await customersService.getCustomersById(
      request.user!.businessId,
      (request.params as unknown as CustomerRouteParams).id,
    );

    response.json({ success: true, data });
  };

  create = async (request: Request, response: Response) => {
    const data = await customersService.createCustomers(
      request.user!.businessId,
      request.body as CustomerCreateInput,
    );

    response.status(201).json({ success: true, data });
  };

  update = async (request: Request, response: Response) => {
    const data = await customersService.updateCustomers(
      request.user!.businessId,
      (request.params as unknown as CustomerRouteParams).id,
      request.body as CustomerUpdateInput,
    );

    response.json({ success: true, data });
  };

  remove = async (request: Request, response: Response) => {
    await customersService.deleteCustomers(
      request.user!.businessId,
      (request.params as unknown as CustomerRouteParams).id,
    );

    response.status(204).send();
  };
}

export const customersController = new CustomersController();
