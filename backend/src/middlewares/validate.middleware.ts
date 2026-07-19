import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../utils/app-error.js";

export function validate(schema: ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: request.body,
      query: request.query,
      params: request.params,
    });

    if (!result.success) {
      next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
      return;
    }

    const data = result.data as {
      body: Request["body"];
      query: Request["query"];
      params: Request["params"];
    };

    request.body = data.body;

    if (request.query && typeof request.query === "object" && data.query && typeof data.query === "object") {
      Object.assign(request.query as Record<string, unknown>, data.query as Record<string, unknown>);
    }

    if (request.params && typeof request.params === "object" && data.params && typeof data.params === "object") {
      Object.assign(request.params, data.params);
    }

    next();
  };
}
