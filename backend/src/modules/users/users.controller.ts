import type { Request, Response } from "express";
import { usersService } from "./users.service.js";

export class UsersController {
  me = async (request: Request, response: Response) => {
    const user = await usersService.getCurrentUser(request.user!.id, request.user!.businessId);
    response.json({
      success: true,
      data: user,
    });
  };

  list = async (request: Request, response: Response) => {
    const users = await usersService.listUsers(request.user!.businessId);
    response.json({
      success: true,
      data: users,
    });
  };
}

export const usersController = new UsersController();
