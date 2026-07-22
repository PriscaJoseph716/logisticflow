import type { Business, Customer } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.js";

export type PortalCustomer = Customer & { business: Business };

function readPortalToken(request: Request): string | undefined {
  const cookieToken = request.cookies?.[env.PORTAL_COOKIE_NAME] as string | undefined;
  if (cookieToken) return cookieToken;

  const header = request.headers.authorization;
  if (!header) return undefined;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;
  return token.trim();
}

export async function portalAuthMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  try {
    const token = readPortalToken(request);
    if (!token) throw new AppError("Authentication required.", 401);

    const payload = verifyToken(token);
    if (payload.typ !== "customer" || !payload.customerId) {
      throw new AppError("Customer authentication required.", 401);
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: payload.customerId,
        businessId: payload.businessId,
        loginEnabled: true,
      },
      include: { business: true },
    });

    if (!customer || !customer.passwordHash) {
      throw new AppError("Authentication required.", 401);
    }

    request.portalCustomer = customer;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError("Authentication required.", 401));
  }
}
