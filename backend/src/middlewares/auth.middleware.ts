import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.js";

export async function authMiddleware(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.cookies?.[env.COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new AppError("Authentication required.", 401);
    }

    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { business: true, customRole: true },
    });

    if (!user || user.businessId !== payload.businessId) {
      throw new AppError("Authentication required.", 401);
    }

    request.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Authentication required.", 401));
  }
}
