import type { Request, Response } from "express";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";

export class HealthController {
  check = async (_request: Request, response: Response) => {
    let databaseStatus: "up" | "down" = "up";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (_error) {
      databaseStatus = "down";
    }

    response.status(databaseStatus === "up" ? 200 : 503).json({
      status: databaseStatus === "up" ? "ok" : "degraded",
      app: env.APP_NAME,
      uptime: process.uptime(),
      database: databaseStatus,
      timestamp: new Date().toISOString(),
    });
  };
}

export const healthController = new HealthController();
