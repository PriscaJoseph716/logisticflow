import type { NextFunction, Request, Response } from "express";
import { allowedOrigins } from "./env.js";

export function corsMiddleware(request: Request, response: Response, next: NextFunction) {
  const origin = request.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
}
