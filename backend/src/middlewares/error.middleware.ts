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

  console.error(error);
  response.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}
