import type { Request, Response } from "express";
import { rolesService } from "./roles.service.js";

export class RolesController {
  list = async (request: Request, response: Response) => {
    const roles = await rolesService.listRoles(request.user!.businessId);
    response.json({
      success: true,
      data: roles,
    });
  };
}

export const rolesController = new RolesController();
