import type { Request, Response } from "express";
import { billingService } from "../services/billing.service.js";

export class BillingController {
  list = async (request: Request, response: Response) => {
    const items = await billingService.list(request.user!.businessId);
    response.json({ success: true, items });
  };

  summary = async (request: Request, response: Response) => {
    const item = await billingService.summary(request.user!.businessId);
    response.json({ success: true, item });
  };
}

export const billingController = new BillingController();
