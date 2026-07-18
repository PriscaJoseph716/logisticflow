import type { Request, Response } from "express";
import { paymentsService } from "./payments.service.js";
import type {
  PaymentCreateInput,
  PaymentListQuery,
  PaymentRouteParams,
  PaymentUpdateInput,
} from "./payments.types.js";

export class PaymentsController {
  list = async (request: Request, response: Response) => {
    const records = await paymentsService.listPayments(
      request.user!.businessId,
      request.query as unknown as PaymentListQuery,
    );

    response.json({
      success: true,
      data: records,
    });
  };

  getById = async (request: Request, response: Response) => {
    const record = await paymentsService.getPaymentById(
      request.user!.businessId,
      (request.params as unknown as PaymentRouteParams).id,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  create = async (request: Request, response: Response) => {
    const record = await paymentsService.createPayment(
      request.user!.businessId,
      request.body as PaymentCreateInput,
    );

    response.status(201).json({
      success: true,
      data: record,
    });
  };

  update = async (request: Request, response: Response) => {
    const record = await paymentsService.updatePayment(
      request.user!.businessId,
      (request.params as unknown as PaymentRouteParams).id,
      request.body as PaymentUpdateInput,
    );

    response.json({
      success: true,
      data: record,
    });
  };

  remove = async (request: Request, response: Response) => {
    await paymentsService.deletePayment(request.user!.businessId, (request.params as unknown as PaymentRouteParams).id);

    response.json({
      success: true,
      message: "Payment deleted successfully.",
    });
  };
}

export const paymentsController = new PaymentsController();
