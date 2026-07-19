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
    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.business.findFirst({ select: { id: true } });

      response.status(200).json({
        success: true,
        message: "Database connected",
        schema: "ready",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database unavailable";
      response.status(503).json({
        success: false,
        message,
        schema: "missing",
      });
    }
  };
}

export const healthController = new HealthController();
