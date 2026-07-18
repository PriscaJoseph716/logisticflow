import { DriverStatus } from "@prisma/client";

export { DriverStatus };
export type DriverLifecycleStatus = DriverStatus;

export const DRIVER_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "fullName",
  "licenseNumber",
  "status",
  "licenseExpiry",
] as const;
export type DriverSortField = (typeof DRIVER_SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export interface DriverVehicleAssignment {
  id: string;
  name: string;
  headPlateNumber: string;
  status: string;
}

export interface DriverRecord {
  id: string;
  businessId: string;
  fullName: string;
  phone: string;
  email: string | null;
  licenseNumber: string;
  licenseExpiry: Date | null;
  status: DriverLifecycleStatus;
  address: string | null;
  emergencyContact: string | null;
  vehicles: DriverVehicleAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverCreateInput {
  fullName: string;
  phone: string;
  email?: string | null;
  licenseNumber: string;
  licenseExpiry?: Date | null;
  status?: DriverLifecycleStatus;
  address?: string | null;
  emergencyContact?: string | null;
}

export interface DriverUpdateInput extends Partial<DriverCreateInput> {}

export interface DriverListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: DriverSortField;
  sortOrder: SortOrder;
  status?: DriverLifecycleStatus;
  licenseExpiryBefore?: Date;
}

export interface DriverListResult {
  items: DriverRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DriverRouteParams {
  id: string;
}

export type DriverPermissionAction = "view" | "create" | "update" | "delete";
