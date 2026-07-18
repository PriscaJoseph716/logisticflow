import type { Request, Response } from "express";
import { driversService } from "./drivers.service.js";
import type {
  DriverCreateInput,
  DriverListQuery,
  DriverRouteParams,
  DriverUpdateInput,
} from "./drivers.types.js";

export class DriversController {
  list = async (request: Request, response: Response) => {
    const data = await driversService.listDrivers(
      request.user!.businessId,
      request.query as unknown as DriverListQuery,
    );

    response.json({ success: true, data });
  };

  getById = async (request: Request, response: Response) => {
    const data = await driversService.getDriversById(
      request.user!.businessId,
      (request.params as unknown as DriverRouteParams).id,
    );

    response.json({ success: true, data });
  };

  create = async (request: Request, response: Response) => {
    const data = await driversService.createDrivers(request.user!.businessId, request.body as DriverCreateInput);
    response.status(201).json({ success: true, data });
  };

  update = async (request: Request, response: Response) => {
    const data = await driversService.updateDrivers(
      request.user!.businessId,
      (request.params as unknown as DriverRouteParams).id,
      request.body as DriverUpdateInput,
    );

    response.json({ success: true, data });
  };

  remove = async (request: Request, response: Response) => {
    await driversService.deleteDrivers(request.user!.businessId, (request.params as unknown as DriverRouteParams).id);
    response.status(204).send();
  };
}

export const driversController = new DriversController();
