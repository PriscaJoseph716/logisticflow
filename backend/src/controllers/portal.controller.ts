import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";
import { portalAuthService } from "../services/portal-auth.service.js";
import { portalService } from "../services/portal.service.js";

function portalCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function clearPortalCookie(response: Response) {
  response.clearCookie(env.PORTAL_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? "none" : "lax",
    path: "/",
  });
}

export class PortalController {
  business = async (request: Request, response: Response) => {
    const business = await portalAuthService.getBusinessPublic(
      String(request.params.businessId || ""),
    );
    response.json({ success: true, business });
  };

  login = async (request: Request, response: Response) => {
    const result = await portalAuthService.login({
      businessId: String(request.params.businessId || request.body.businessId || ""),
      customerCode: request.body.customerCode ?? request.body.customerId,
      password: request.body.password,
    });

    response.cookie(env.PORTAL_COOKIE_NAME, result.token, portalCookieOptions());
    response.json({
      success: true,
      token: result.token,
      customer: result.customer,
      business: result.business,
    });
  };

  logout = async (_request: Request, response: Response) => {
    clearPortalCookie(response);
    response.json({ success: true, message: "Logged out." });
  };

  me = async (request: Request, response: Response) => {
    const result = await portalAuthService.me(
      request.portalCustomer!.id,
      request.portalCustomer!.businessId,
    );
    response.json({ success: true, ...result });
  };

  changePassword = async (request: Request, response: Response) => {
    const customer = await portalAuthService.changePassword(
      request.portalCustomer!.id,
      request.portalCustomer!.businessId,
      request.body,
    );
    response.json({ success: true, customer });
  };

  dashboard = async (request: Request, response: Response) => {
    const summary = await portalService.dashboard(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
    );
    response.json({ success: true, summary });
  };

  orders = async (request: Request, response: Response) => {
    const data = await portalService.listOrders(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
    );
    response.json({ success: true, ...data });
  };

  createOrder = async (request: Request, response: Response) => {
    const order = await portalService.createOrder(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
      request.body,
    );
    response.status(201).json({ success: true, order });
  };

  invoices = async (request: Request, response: Response) => {
    const items = await portalService.listInvoices(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
    );
    response.json({ success: true, items });
  };

  invoice = async (request: Request, response: Response) => {
    const item = await portalService.getInvoice(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
      String(request.params.id),
    );
    response.json({ success: true, item });
  };

  payments = async (request: Request, response: Response) => {
    const items = await portalService.listPayments(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
    );
    response.json({ success: true, items });
  };

  statement = async (request: Request, response: Response) => {
    const statement = await portalService.accountStatement(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
    );
    response.json({ success: true, statement });
  };

  tracking = async (request: Request, response: Response) => {
    const items = await portalService.tracking(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
    );
    response.json({ success: true, items });
  };

  notifications = async (request: Request, response: Response) => {
    const items = await portalService.listNotifications(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
    );
    response.json({ success: true, items });
  };

  readNotification = async (request: Request, response: Response) => {
    const item = await portalService.markNotificationRead(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
      String(request.params.id),
    );
    response.json({ success: true, item });
  };

  updateProfile = async (request: Request, response: Response) => {
    const customer = await portalService.updateProfile(
      request.portalCustomer!.businessId,
      request.portalCustomer!.id,
      request.body,
    );
    const { passwordHash: _omit, ...safe } = customer;
    response.json({ success: true, customer: safe });
  };

  // Admin endpoints
  adminOrders = async (request: Request, response: Response) => {
    const items = await portalService.listBusinessOrderRequests(request.user!.businessId);
    response.json({ success: true, items });
  };

  adminUpdateOrder = async (request: Request, response: Response) => {
    const item = await portalService.updateOrderRequestStatus(
      request.user!.businessId,
      String(request.params.id),
      String(request.body.status || ""),
    );
    response.json({ success: true, item });
  };
}

export const portalController = new PortalController();
