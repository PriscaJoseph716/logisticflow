import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    response.status(503).json({
      success: false,
      message: "Database connection is unavailable. Please try again shortly.",
      code: "DATABASE_UNAVAILABLE",
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientUnknownRequestError) {
    response.status(503).json({
      success: false,
      message: "Database request failed. Please try again shortly.",
      code: "DATABASE_REQUEST_FAILED",
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}
