export const SUPPLIER_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "supplierCode",
  "name",
  "location",
  "buyingPrice",
  "sellingPrice",
] as const;
export type SupplierSortField = (typeof SUPPLIER_SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export interface SupplierRecord {
  id: string;
  businessId: string;
  supplierCode: string;
  name: string;
  contact: string | null;
  location: string | null;
  buyingPrice: number | null;
  sellingPrice: number | null;
  shipmentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierCreateInput {
  supplierCode: string;
  name: string;
  contact?: string | null;
  location?: string | null;
  buyingPrice?: number | null;
  sellingPrice?: number | null;
}

export interface SupplierUpdateInput extends Partial<SupplierCreateInput> {}

export interface SupplierListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: SupplierSortField;
  sortOrder: SortOrder;
  location?: string;
}

export interface SupplierListResult {
  items: SupplierRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SupplierRouteParams {
  id: string;
}

export type SupplierPermissionAction = "view" | "create" | "update" | "delete";
