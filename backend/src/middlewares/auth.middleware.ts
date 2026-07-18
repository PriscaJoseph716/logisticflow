import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/app-error.js";

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.headers.authorization?.startsWith("Bearer ")
      ? request.headers.authorization.slice(7)
      : undefined;

    if (!token) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        businessId: payload.businessId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      next(new AppError("Invalid authentication session", 401, "UNAUTHORIZED"));
      return;
    }

    request.user = {
      id: user.id,
      businessId: user.businessId,
      role: user.role?.name ?? "Viewer",
      permissions: user.role?.rolePermissions.map((entry) => entry.permission.key) ?? [],
      email: user.email,
    };

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED", error));
  }
}

export function requirePermission(permission: string) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const permissions = request.user?.permissions ?? [];
    const aliases = new Set([permission]);

    if (permission.endsWith(":update")) {
      aliases.add(permission.replace(/:update$/, ":edit"));
    }

    if (permission.endsWith(":edit")) {
      aliases.add(permission.replace(/:edit$/, ":update"));
    }

    const allowed = Array.from(aliases).some((entry) => permissions.includes(entry));

    if (!allowed) {
      next(new AppError("You do not have permission to perform this action.", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
