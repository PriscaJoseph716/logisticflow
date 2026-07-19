import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Validates request body with Zod.
 * Express 5 safe: never assigns to req.body, req.query, or req.params.
 */
export function validate(schema: ZodTypeAny) {
  return (request: Request, response: Response, next: NextFunction) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      response.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
      return;
    }

    next();
  };
}
