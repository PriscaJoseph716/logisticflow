import type { DeliveryStatus, Prisma, ShipmentStatus } from "@prisma/client";

export type SortOrder = "asc" | "desc";
export type ShipmentSortField =
  | "createdAt"
  | "updatedAt"
  | "scheduledDate"
  | "shipmentCode"
  | "origin"
  | "destination"
  | "status";

export interface ShipmentRouteParams {
  id: string;
}

export interface ShipmentListQuery {
  search?: string;
  status?: ShipmentStatus;
  deliveryStatus?: DeliveryStatus;
  customerId?: string;
  supplierId?: string;
  vehicleId?: string;
  driverId?: string;
  scheduledFrom?: Date;
  scheduledTo?: Date;
  sortBy: ShipmentSortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface ShipmentCreateInput {
  shipmentCode: string;
  customerId?: string;
  supplierId?: string;
  vehicleId?: string;
  driverId?: string;
  origin: string;
  destination: string;
  cargoDescription?: string;
  quantityTons?: number;
  status?: ShipmentStatus;
  deliveryStatus?: DeliveryStatus;
  scheduledDate?: Date;
  pickupDate?: Date;
  deliveredAt?: Date;
  trackingReference?: string;
  notes?: string;
}

export interface ShipmentUpdateInput extends Partial<ShipmentCreateInput> {}

export const shipmentInclude = {
  customer: true,
  supplier: true,
  vehicle: true,
  driver: true,
  delivery: true,
  invoices: true,
} satisfies Prisma.ShipmentInclude;

export type ShipmentRecord = Prisma.ShipmentGetPayload<{
  include: typeof shipmentInclude;
}>;

export interface ShipmentListResult {
  items: ShipmentRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
