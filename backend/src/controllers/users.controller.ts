import type { Request, Response } from "express";
import { usersService } from "../services/users.service.js";

export class UsersController {
  list = async (request: Request, response: Response) => {
    const users = await usersService.listTeam(request.user!.businessId);
    response.json({ success: true, users });
  };

  create = async (request: Request, response: Response) => {
    const worker = await usersService.createWorker(request.user!.businessId, request.body);
    response.status(201).json({
      success: true,
      user: worker,
      message: "Worker created. Share the login details securely.",
    });
  };
}

export const usersController = new UsersController();
