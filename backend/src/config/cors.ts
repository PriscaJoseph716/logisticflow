import type { CorsOptions } from "cors";
import type { Request, Response, NextFunction } from "express";
import { env } from "./env.js";

const allowedOrigins = new Set([
  "https://logisticflow.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

export function isAllowedOrigin(origin: string | undefined) {
  return !origin || allowedOrigins.has(origin);
}

export function corsOriginLogger(request: Request, _response: Response, next: NextFunction) {
  const origin = request.headers.origin;
  console.info(`[cors] ${request.method} ${request.originalUrl} origin=${origin ?? "none"}`);
  next();
}

export function corsOriginGuard(request: Request, response: Response, next: NextFunction) {
  const origin = request.headers.origin;
  if (isAllowedOrigin(origin)) {
    next();
    return;
  }

  response.status(403).json({
    success: false,
    message: "Origin is not allowed.",
    code: "CORS_ORIGIN_DENIED",
    origin,
    allowedOrigins: Array.from(allowedOrigins),
  });
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    console.info(`[cors] evaluating origin=${origin ?? "none"}`);
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
