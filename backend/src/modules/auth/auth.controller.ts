import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { authService } from "./auth.service.js";

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

export class AuthController {
  registerCompany = async (request: Request, response: Response) => {
    const result = await authService.registerCompany(request.body);
    setRefreshCookie(response, result.refreshToken);
    const { refreshToken: _refreshToken, ...responseData } = result;

    response.status(201).json({
      success: true,
      message: "Company registered successfully.",
      data: responseData,
    });
  };

  login = async (request: Request, response: Response) => {
    const result = await authService.login(request.body);
    setRefreshCookie(response, result.refreshToken);
    const { refreshToken: _refreshToken, ...responseData } = result;

    response.json({
      success: true,
      message: "Login successful.",
      data: responseData,
    });
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
