import type { Request, Response } from "express";
import { permissionsService } from "./permissions.service.js";

export class PermissionsController {
  list = async (request: Request, response: Response) => {
    const permissions = await permissionsService.listPermissions(request.user!.businessId);
    response.json({
      success: true,
      data: permissions,
    });
  };
}

export const permissionsController = new PermissionsController();
