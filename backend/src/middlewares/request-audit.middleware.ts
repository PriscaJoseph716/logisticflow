import type { NextFunction, Request, Response } from "express";
import { auditService } from "../services/audit.service.js";

export function createRequestAuditMiddleware(entity: string) {
  return (request: Request, response: Response, next: NextFunction) => {
    response.on("finish", () => {
      if (!request.user?.businessId) {
        return;
      }

      void auditService.logAction({
        businessId: request.user.businessId,
        userId: request.user.id,
        action: `${request.method} ${request.baseUrl}${request.route?.path ?? ""}`,
        entity,
        entityId: typeof request.params.id === "string" ? request.params.id : undefined,
        after: request.method === "GET" ? undefined : request.body,
        metadata: {
          statusCode: response.statusCode,
          query: request.query,
          path: request.originalUrl,
        },
      });
    });

    next();
  };
}
