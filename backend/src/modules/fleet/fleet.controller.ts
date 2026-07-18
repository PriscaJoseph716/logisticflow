import type { Request, Response } from "express";
import { fleetService } from "./fleet.service.js";
import type { FleetCreateInput, FleetListQuery, FleetRouteParams, FleetUpdateInput } from "./fleet.types.js";

export class FleetController {
  list = async (request: Request, response: Response) => {
    const data = await fleetService.listFleet(
      request.user!.businessId,
      request.query as unknown as FleetListQuery,
    );

    response.json({ success: true, data });
  };

  getById = async (request: Request, response: Response) => {
    const data = await fleetService.getFleetById(
      request.user!.businessId,
      (request.params as unknown as FleetRouteParams).id,
    );

    response.json({ success: true, data });
  };

  create = async (request: Request, response: Response) => {
    const data = await fleetService.createFleet(request.user!.businessId, request.body as FleetCreateInput);
    response.status(201).json({ success: true, data });
  };

  update = async (request: Request, response: Response) => {
    const data = await fleetService.updateFleet(
      request.user!.businessId,
      (request.params as unknown as FleetRouteParams).id,
      request.body as FleetUpdateInput,
    );

    response.json({ success: true, data });
  };

  remove = async (request: Request, response: Response) => {
    await fleetService.deleteFleet(request.user!.businessId, (request.params as unknown as FleetRouteParams).id);
    response.status(204).send();
  };
}

export const fleetController = new FleetController();
