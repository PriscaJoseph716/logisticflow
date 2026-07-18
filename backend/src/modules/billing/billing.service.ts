import { AppError } from "../../utils/app-error.js";
import { billingRepository } from "./billing.repository.js";
import type {
  BillingCreateInput,
  BillingListQuery,
  BillingSummaryQuery,
  BillingUpdateInput,
} from "./billing.types.js";

export class BillingService {
  async listBilling(businessId: string, query: BillingListQuery) {
    return billingRepository.list(businessId, query);
  }

  async getSummary(businessId: string, query: BillingSummaryQuery) {
    return billingRepository.getSummary(businessId, query);
  }

  async getBillingById(businessId: string, billingId: string) {
    const record = await billingRepository.findById(businessId, billingId);

    if (!record) {
      throw new AppError("Billing record not found.", 404, "BILLING_NOT_FOUND");
    }

    return record;
  }

  async createBilling(businessId: string, payload: BillingCreateInput) {
    return billingRepository.create(businessId, payload);
  }

  async updateBilling(businessId: string, billingId: string, payload: BillingUpdateInput) {
    const record = await billingRepository.update(businessId, billingId, payload);

    if (!record) {
      throw new AppError("Billing record not found.", 404, "BILLING_NOT_FOUND");
    }

    return record;
  }

  async deleteBilling(businessId: string, billingId: string) {
    const wasDeleted = await billingRepository.remove(businessId, billingId);

    if (!wasDeleted) {
      throw new AppError("Billing record not found.", 404, "BILLING_NOT_FOUND");
    }
  }
}

export const billingService = new BillingService();
