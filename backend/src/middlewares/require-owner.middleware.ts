import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";

export function requireOwner(request: Request, _response: Response, next: NextFunction) {
  if (request.user?.role !== "OWNER") {
    next(new AppError("Only the business owner can perform this action.", 403));
    return;
  }

  next();
}
