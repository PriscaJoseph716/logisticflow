import type { Request, Response } from "express";
import { billingService } from "./billing.service.js";
import type {
  BillingCreateInput,
  BillingListQuery,
  BillingRouteParams,
  BillingSummaryQuery,
  BillingUpdateInput,
} from "./billing.types.js";

export class BillingController {
  summary = async (request: Request, response: Response) => {
    const summary = await billingService.getSummary(
      request.user!.businessId,
      request.query as unknown as BillingSummaryQuery,
    );

    response.json({
      success: true,
      data: summary,
    });
  };

  list = async (request: Request, response: Response) => {
    const records = await billingService.listBilling(
      request.user!.businessId,
      request.query as unknown as BillingListQuery,
    );

    response.json({
      success: true,
      data: records,
    });
  };

  getById = async (request: Request, response: Response) => {
    const record = await billingService.getBillingById(
      request.user!.businessId,
      (request.params as unknown as BillingRouteParams).id,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  create = async (request: Request, response: Response) => {
    const record = await billingService.createBilling(
      request.user!.businessId,
      request.body as BillingCreateInput,
    );

    response.status(201).json({
      success: true,
      data: record,
    });
  };

  update = async (request: Request, response: Response) => {
    const record = await billingService.updateBilling(
      request.user!.businessId,
      (request.params as unknown as BillingRouteParams).id,
      request.body as BillingUpdateInput,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  remove = async (request: Request, response: Response) => {
    await billingService.deleteBilling(request.user!.businessId, (request.params as unknown as BillingRouteParams).id);

    response.json({
      success: true,
      message: "Billing record deleted successfully.",
    });
  };
}

export const billingController = new BillingController();
