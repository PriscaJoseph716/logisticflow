import type { DeliveryStatus, Prisma } from "@prisma/client";

export type SortOrder = "asc" | "desc";
export type DeliverySortField =
  | "createdAt"
  | "updatedAt"
  | "deliveryCode"
  | "status"
  | "deliveredAt";

export interface DeliveryRouteParams {
  id: string;
}

export interface DeliveryListQuery {
  search?: string;
  status?: DeliveryStatus;
  shipmentId?: string;
  customerId?: string;
  vehicleId?: string;
  driverId?: string;
  deliveredFrom?: Date;
  deliveredTo?: Date;
  sortBy: DeliverySortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;
}

export interface DeliveryCreateInput {
  deliveryCode: string;
  shipmentId?: string;
  customerId?: string;
  vehicleId?: string;
  driverId?: string;
  status?: DeliveryStatus;
  deliveredAt?: Date;
  proofOfDeliveryUrl?: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
}

export interface DeliveryUpdateInput extends Partial<DeliveryCreateInput> {}

export const deliveryInclude = {
  shipment: true,
  customer: true,
  vehicle: true,
  driver: true,
} satisfies Prisma.DeliveryInclude;

export type DeliveryRecord = Prisma.DeliveryGetPayload<{
  include: typeof deliveryInclude;
}>;

export interface DeliveryListResult {
  items: DeliveryRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
