export const CUSTOMER_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "customerCode",
  "name",
  "email",
  "location",
] as const;
export type CustomerSortField = (typeof CUSTOMER_SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export interface CustomerRecord {
  id: string;
  businessId: string;
  customerCode: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  contactPerson: string | null;
  notes: string | null;
  shipmentsCount: number;
  deliveriesCount: number;
  invoicesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerCreateInput {
  customerCode: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  contactPerson?: string | null;
  notes?: string | null;
}

export interface CustomerUpdateInput extends Partial<CustomerCreateInput> {}

export interface CustomerListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: CustomerSortField;
  sortOrder: SortOrder;
  location?: string;
}

export interface CustomerListResult {
  items: CustomerRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerRouteParams {
  id: string;
}

export type CustomerPermissionAction = "view" | "create" | "update" | "delete";
