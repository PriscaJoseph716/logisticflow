import { z } from "zod";

const shipmentStatuses = ["PENDING", "ASSIGNED", "IN_TRANSIT", "DELAYED", "DELIVERED", "CANCELLED"] as const;
const deliveryStatuses = ["SCHEDULED", "IN_TRANSIT", "COMPLETED", "FAILED"] as const;
const shipmentSortFields = ["createdAt", "updatedAt", "scheduledDate", "shipmentCode", "origin", "destination", "status"] as const;
const idSchema = z.string().min(1);

export const listShipmentsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    search: z.string().trim().min(1).optional(),
    status: z.enum(shipmentStatuses).optional(),
    deliveryStatus: z.enum(deliveryStatuses).optional(),
    customerId: idSchema.optional(),
    supplierId: idSchema.optional(),
    vehicleId: idSchema.optional(),
    driverId: idSchema.optional(),
    scheduledFrom: z.coerce.date().optional(),
    scheduledTo: z.coerce.date().optional(),
    sortBy: z.enum(shipmentSortFields).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
  params: z.object({}).passthrough(),
});

export const getShipmentSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const createShipmentSchema = z.object({
  body: z.object({
    shipmentCode: z.string().trim().min(2).max(50),
    customerId: idSchema.optional(),
    supplierId: idSchema.optional(),
    vehicleId: idSchema.optional(),
    driverId: idSchema.optional(),
    origin: z.string().trim().min(2).max(120),
    destination: z.string().trim().min(2).max(120),
    cargoDescription: z.string().trim().max(500).optional(),
    quantityTons: z.coerce.number().nonnegative().optional(),
    status: z.enum(shipmentStatuses).optional(),
    deliveryStatus: z.enum(deliveryStatuses).optional(),
    scheduledDate: z.coerce.date().optional(),
    pickupDate: z.coerce.date().optional(),
    deliveredAt: z.coerce.date().optional(),
    trackingReference: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateShipmentSchema = z.object({
  body: z
    .object({
      shipmentCode: z.string().trim().min(2).max(50).optional(),
      customerId: idSchema.optional(),
      supplierId: idSchema.optional(),
      vehicleId: idSchema.optional(),
      driverId: idSchema.optional(),
      origin: z.string().trim().min(2).max(120).optional(),
      destination: z.string().trim().min(2).max(120).optional(),
      cargoDescription: z.string().trim().max(500).optional(),
      quantityTons: z.coerce.number().nonnegative().optional(),
      status: z.enum(shipmentStatuses).optional(),
      deliveryStatus: z.enum(deliveryStatuses).optional(),
      scheduledDate: z.coerce.date().optional(),
      pickupDate: z.coerce.date().optional(),
      deliveredAt: z.coerce.date().optional(),
      trackingReference: z.string().trim().max(100).optional(),
      notes: z.string().trim().max(1000).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required."),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const deleteShipmentSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});
