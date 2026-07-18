import { AppError } from "../../utils/app-error.js";
import { paymentsRepository } from "./payments.repository.js";
import type {
  PaymentCreateInput,
  PaymentListQuery,
  PaymentUpdateInput,
} from "./payments.types.js";

export class PaymentsService {
  async listPayments(businessId: string, query: PaymentListQuery) {
    return paymentsRepository.list(businessId, query);
  }

  async getPaymentById(businessId: string, paymentId: string) {
    const record = await paymentsRepository.findById(businessId, paymentId);

    if (!record) {
      throw new AppError("Payment not found.", 404, "PAYMENT_NOT_FOUND");
    }

    return record;
  }

  async createPayment(businessId: string, payload: PaymentCreateInput) {
    return paymentsRepository.create(businessId, payload);
  }

  async updatePayment(businessId: string, paymentId: string, payload: PaymentUpdateInput) {
    const record = await paymentsRepository.update(businessId, paymentId, payload);

    if (!record) {
      throw new AppError("Payment not found.", 404, "PAYMENT_NOT_FOUND");
    }

    return record;
  }

  async deletePayment(businessId: string, paymentId: string) {
    const wasDeleted = await paymentsRepository.remove(businessId, paymentId);

    if (!wasDeleted) {
      throw new AppError("Payment not found.", 404, "PAYMENT_NOT_FOUND");
    }
  }
}

export const paymentsService = new PaymentsService();
