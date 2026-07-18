import type { Prisma } from "@prisma/client";
import { VehicleStatus } from "@prisma/client";

export { VehicleStatus };
export type FleetStatus = VehicleStatus;

export const FLEET_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "headPlateNumber",
  "vehicleType",
  "status",
  "mileage",
] as const;
export type FleetSortField = (typeof FLEET_SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export interface FleetAssignedDriver {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface FleetRecord {
  id: string;
  businessId: string;
  name: string;
  headPlateNumber: string;
  trailerPlateNumber: string | null;
  vehicleType: string;
  category: string | null;
  status: FleetStatus;
  insuranceExpiry: Date | null;
  licenseExpiry: Date | null;
  documentsJson: Prisma.JsonValue | null;
  mileage: number;
  fuelLevel: number;
  fuelType: string | null;
  assignedDriverId: string | null;
  assignedDriver: FleetAssignedDriver | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FleetCreateInput {
  name: string;
  headPlateNumber: string;
  trailerPlateNumber?: string | null;
  vehicleType: string;
  category?: string | null;
  status?: FleetStatus;
  insuranceExpiry?: Date | null;
  licenseExpiry?: Date | null;
  documentsJson?: Prisma.JsonValue | null;
  mileage?: number;
  fuelLevel?: number;
  fuelType?: string | null;
  assignedDriverId?: string | null;
}

export interface FleetUpdateInput extends Partial<FleetCreateInput> {}

export interface FleetListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: FleetSortField;
  sortOrder: SortOrder;
  status?: FleetStatus;
  vehicleType?: string;
  category?: string;
  assignedDriverId?: string;
}

export interface FleetListResult {
  items: FleetRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FleetRouteParams {
  id: string;
}

export type FleetPermissionAction = "view" | "create" | "update" | "delete";
