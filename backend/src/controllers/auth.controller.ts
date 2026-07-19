import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export class AuthController {
  register = async (request: Request, response: Response) => {
    const result = await authService.register(request.body);

    response.cookie(env.COOKIE_NAME, result.token, cookieOptions());

    response.status(201).json({
      success: true,
      user: result.user,
      business: result.business,
    });
  };

  login = async (request: Request, response: Response) => {
    const result = await authService.login(request.body);

    response.cookie(env.COOKIE_NAME, result.token, cookieOptions());

    response.json({
      success: true,
      user: result.user,
      business: result.business,
    });
  };

  logout = async (_request: Request, response: Response) => {
    response.clearCookie(env.COOKIE_NAME, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SECURE ? "none" : "lax",
      path: "/",
    });

    response.json({
      success: true,
      message: "Logged out.",
    });
  };

  me = async (request: Request, response: Response) => {
    const result = await authService.getMe(request.user!.id);

    response.json({
      success: true,
      user: result.user,
      business: result.business,
    });
  };
}

export const authController = new AuthController();
