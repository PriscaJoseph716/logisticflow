import { AppError } from "../../utils/app-error.js";
import { suppliersRepository } from "./suppliers.repository.js";
import type { SupplierCreateInput, SupplierListQuery, SupplierUpdateInput } from "./suppliers.types.js";

export class SuppliersService {
  async listSuppliers(businessId: string, query: SupplierListQuery) {
    return suppliersRepository.list(businessId, query);
  }

  async getSuppliersById(businessId: string, id: string) {
    const supplier = await suppliersRepository.findById(businessId, id);

    if (!supplier) {
      throw new AppError("Supplier not found.", 404, "SUPPLIER_NOT_FOUND");
    }

    return supplier;
  }

  async createSuppliers(businessId: string, input: SupplierCreateInput) {
    return suppliersRepository.create(businessId, input);
  }

  async updateSuppliers(businessId: string, id: string, input: SupplierUpdateInput) {
    const supplier = await suppliersRepository.update(businessId, id, input);

    if (!supplier) {
      throw new AppError("Supplier not found.", 404, "SUPPLIER_NOT_FOUND");
    }

    return supplier;
  }

  async deleteSuppliers(businessId: string, id: string) {
    const removed = await suppliersRepository.remove(businessId, id);

    if (!removed) {
      throw new AppError("Supplier not found.", 404, "SUPPLIER_NOT_FOUND");
    }
  }
}

export const suppliersService = new SuppliersService();
