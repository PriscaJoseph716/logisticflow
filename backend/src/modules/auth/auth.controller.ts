import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { env } from "../../config/env.js";
import { authService } from "./auth.service.js";
import { AppError } from "../../utils/app-error.js";

function setRefreshCookie(response: Response, refreshToken: string) {
  response.cookie(env.JWT_REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    path: "/",
  });
}

function clearRefreshCookie(response: Response) {
  response.clearCookie(env.JWT_REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    path: "/",
  });
}

function getFailingStep(error: unknown): string | undefined {
  if (error && typeof error === "object" && "failingStep" in error) {
    const step = (error as { failingStep?: unknown }).failingStep;
    return typeof step === "string" ? step : undefined;
  }

  return undefined;
}

function buildDebugErrorPayload(error: unknown, code: string) {
  const failingStep = getFailingStep(error);
  const payload: Record<string, unknown> = {
    success: false,
    code,
    failingStep: failingStep ?? null,
  };

  if (error instanceof AppError) {
    payload.message = error.message;
    payload.appErrorCode = error.code;
    payload.details = error.details;
    payload.statusCode = error.statusCode;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    payload.message = error.message;
    payload.prisma = {
      name: error.name,
      code: error.code,
      meta: error.meta,
      clientVersion: error.clientVersion,
    };
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    payload.message = error.message;
    payload.prisma = {
      name: error.name,
      clientVersion: error.clientVersion,
    };
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    payload.message = error.message;
    payload.prisma = {
      name: error.name,
      errorCode: error.errorCode,
      clientVersion: error.clientVersion,
    };
  } else if (error instanceof Error) {
    payload.message = error.message;
    payload.name = error.name;
  } else {
    payload.message = String(error);
  }

  if (error instanceof Error) {
    payload.stack = error.stack;
  }

  return payload;
}

function logRegisterError(error: unknown) {
  console.error("[auth.register] ========== COMPLETE ERROR ==========");
  console.error(error);

  if (error instanceof Error) {
    console.error("[auth.register] error.name:", error.name);
    console.error("[auth.register] error.message:", error.message);
    console.error("[auth.register] error.stack:\n", error.stack);
  }

  const failingStep = getFailingStep(error);
  if (failingStep) {
    console.error("[auth.register] failingStep:", failingStep);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[auth.register] PrismaClientKnownRequestError", {
      code: error.code,
      meta: error.meta,
      message: error.message,
      clientVersion: error.clientVersion,
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("[auth.register] PrismaClientValidationError:", error.message);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[auth.register] PrismaClientInitializationError:", {
      message: error.message,
      errorCode: error.errorCode,
      clientVersion: error.clientVersion,
    });
  }

  if (error instanceof AppError) {
    console.error("[auth.register] AppError:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });
  }

  console.error("[auth.register] ========== END ERROR ==========");
}

export class AuthController {
  registerCompany = async (request: Request, response: Response) => {
    try {
      console.info("[auth.register] request received", {
        email: request.body?.email,
        companyName: request.body?.companyName,
        fullName: request.body?.fullName,
      });

      const result = await authService.registerCompany(request.body);
      console.info("[auth.register] service completed", {
        userId: result.user.id,
        businessId: result.business.businessId,
      });

      setRefreshCookie(response, result.refreshToken);
      const { refreshToken: _refreshToken, ...responseData } = result;

      response.status(201).json({
        success: true,
        message: "Company registered successfully.",
        data: responseData,
      });
    } catch (error) {
      // Debug mode: never hide the real exception while diagnosing register 500s.
      logRegisterError(error);

      const statusCode = error instanceof AppError ? error.statusCode : 500;
      response.status(statusCode).json(buildDebugErrorPayload(error, "AUTH_REGISTER_FAILED"));
    }
  };

  login = async (request: Request, response: Response) => {
    try {
      console.info("[auth.login] request received", {
        email: request.body?.email,
      });

      const result = await authService.login(request.body);
      console.info("[auth.login] service completed", {
        userId: result.user.id,
        businessId: result.business.businessId,
      });

      setRefreshCookie(response, result.refreshToken);
      const { refreshToken: _refreshToken, ...responseData } = result;

      response.json({
        success: true,
        message: "Login successful.",
        data: responseData,
      });
    } catch (error) {
      console.error("[auth.login] failed with full error:", error);

      if (error instanceof Error) {
        console.error("[auth.login] stack:", error.stack);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("[auth.login] prisma known error", {
          code: error.code,
          meta: error.meta,
          message: error.message,
        });
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        console.error("[auth.login] prisma validation error", error.message);
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        console.error("[auth.login] prisma init error", error.message);
      }

      if (error instanceof AppError) {
        throw error;
      }

      // Temporary: expose real login error while diagnosing auth failures.
      response.status(500).json(buildDebugErrorPayload(error, "AUTH_LOGIN_FAILED"));
    }
  };

  logout = async (request: Request, response: Response) => {
    const refreshToken = request.cookies?.[env.JWT_REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logout(refreshToken);
    clearRefreshCookie(response);

    response.json({
      success: true,
      message: "Logout successful.",
    });
  };

  refreshToken = async (request: Request, response: Response) => {
    const refreshToken =
      (request.body.refreshToken as string | undefined) ?? (request.cookies?.[env.JWT_REFRESH_COOKIE_NAME] as string | undefined);
    const result = await authService.refreshSession(refreshToken);
    setRefreshCookie(response, result.refreshToken);
    const { refreshToken: _refreshToken, ...responseData } = result;

    response.json({
      success: true,
      message: "Session refreshed successfully.",
      data: responseData,
    });
  };

  forgotPassword = async (request: Request, response: Response) => {
    const result = await authService.forgotPassword(request.body.email);
    response.json({
      success: true,
      ...result,
    });
  };

  resetPassword = async (request: Request, response: Response) => {
    const result = await authService.resetPassword(request.body.token, request.body.password);
    response.json({
      success: true,
      ...result,
    });
  };

  changePassword = async (request: Request, response: Response) => {
    const result = await authService.changePassword(request.user!.id, request.user!.businessId, request.body);
    response.json({
      success: true,
      ...result,
    });
  };

  verifyEmail = async (request: Request, response: Response) => {
    const result = await authService.verifyEmail(request.body.token);
    response.json({
      success: true,
      ...result,
    });
  };
}

export const authController = new AuthController();
