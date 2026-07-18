import { AppError } from "../../utils/app-error.js";
import { customersRepository } from "./customers.repository.js";
import type { CustomerCreateInput, CustomerListQuery, CustomerUpdateInput } from "./customers.types.js";

export class CustomersService {
  async listCustomers(businessId: string, query: CustomerListQuery) {
    return customersRepository.list(businessId, query);
  }

  async getCustomersById(businessId: string, id: string) {
    const customer = await customersRepository.findById(businessId, id);

    if (!customer) {
      throw new AppError("Customer not found.", 404, "CUSTOMER_NOT_FOUND");
    }

    return customer;
  }

  async createCustomers(businessId: string, input: CustomerCreateInput) {
    return customersRepository.create(businessId, input);
  }

  async updateCustomers(businessId: string, id: string, input: CustomerUpdateInput) {
    const customer = await customersRepository.update(businessId, id, input);

    if (!customer) {
      throw new AppError("Customer not found.", 404, "CUSTOMER_NOT_FOUND");
    }

    return customer;
  }

  async deleteCustomers(businessId: string, id: string) {
    const removed = await customersRepository.remove(businessId, id);

    if (!removed) {
      throw new AppError("Customer not found.", 404, "CUSTOMER_NOT_FOUND");
    }
  }
}

export const customersService = new CustomersService();
