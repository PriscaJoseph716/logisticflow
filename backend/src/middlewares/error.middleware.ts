import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  console.error("[error-handler] ========== COMPLETE ERROR ==========");
  console.error(error);

  if (error instanceof Error) {
    console.error("[error-handler] name:", error.name);
    console.error("[error-handler] message:", error.message);
    console.error("[error-handler] stack:\n", error.stack);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[error-handler] Prisma known error:", {
      code: error.code,
      meta: error.meta,
      message: error.message,
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("[error-handler] Prisma validation error:", error.message);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[error-handler] Prisma init error:", error.message);
  }

  console.error("[error-handler] ========== END ERROR ==========");

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    response.status(503).json({
      success: false,
      message: error.message,
      code: "DATABASE_UNAVAILABLE",
      prisma: {
        name: error.name,
        errorCode: error.errorCode,
        clientVersion: error.clientVersion,
      },
      stack: error.stack,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    response.status(500).json({
      success: false,
      message: error.message,
      code: "DATABASE_REQUEST_FAILED",
      prisma: {
        name: error.name,
        code: error.code,
        meta: error.meta,
        clientVersion: error.clientVersion,
      },
      stack: error.stack,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError || error instanceof Prisma.PrismaClientValidationError) {
    response.status(500).json({
      success: false,
      message: error.message,
      code: "DATABASE_REQUEST_FAILED",
      stack: error.stack,
    });
    return;
  }

  response.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    stack: error instanceof Error ? error.stack : undefined,
  });
}
