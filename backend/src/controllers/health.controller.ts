import type { Request, Response } from "express";
import { prisma } from "../config/database.js";

export class HealthController {
  root = async (_request: Request, response: Response) => {
    response.json({
      success: true,
      message: "Backend running",
    });
  };

  health = async (_request: Request, response: Response) => {
    await prisma.$queryRaw`SELECT 1`;

    response.json({
      success: true,
      message: "Database connected",
    });
  };
}

export const healthController = new HealthController();
