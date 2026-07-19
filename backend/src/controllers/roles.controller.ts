import type { Request, Response } from "express";
import { roleService } from "../services/role.service.js";

export class RolesController {
  list = async (request: Request, response: Response) => {
    const result = await roleService.listRoles(request.user!.businessId);
    response.json({ success: true, ...result });
  };

  create = async (request: Request, response: Response) => {
    const role = await roleService.createRole(request.user!.businessId, request.body);
    response.status(201).json({ success: true, role });
  };
}

export const rolesController = new RolesController();
