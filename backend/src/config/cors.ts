import type { NextFunction, Request, Response } from "express";

const allowedOrigins = [
  "https://logisticflow.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const allowedHeaders = ["Content-Type", "Authorization"];

function isAllowedOrigin(origin: string | undefined) {
  return !origin || allowedOrigins.includes(origin);
}

export function corsMiddleware(request: Request, response: Response, next: NextFunction) {
  const origin = request.headers.origin;
  console.log("Incoming Origin:", origin);
  console.log("Allowed Origins:", allowedOrigins);

  if (origin && allowedOrigins.includes(origin)) {
    response.header("Access-Control-Allow-Origin", origin);
    response.header("Vary", "Origin");
  }

  if (isAllowedOrigin(origin)) {
    response.header("Access-Control-Allow-Credentials", "true");
    response.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
    response.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));
  }

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
}
