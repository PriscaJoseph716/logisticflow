import { z } from "zod";

const deliveryStatuses = ["SCHEDULED", "IN_TRANSIT", "COMPLETED", "FAILED"] as const;
const deliverySortFields = ["createdAt", "updatedAt", "deliveryCode", "status", "deliveredAt"] as const;
const idSchema = z.string().min(1);

export const listDeliveriesSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    search: z.string().trim().min(1).optional(),
    status: z.enum(deliveryStatuses).optional(),
    shipmentId: idSchema.optional(),
    customerId: idSchema.optional(),
    vehicleId: idSchema.optional(),
    driverId: idSchema.optional(),
    deliveredFrom: z.coerce.date().optional(),
    deliveredTo: z.coerce.date().optional(),
    sortBy: z.enum(deliverySortFields).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
  params: z.object({}).passthrough(),
});

export const getDeliverySchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const createDeliverySchema = z.object({
  body: z.object({
    deliveryCode: z.string().trim().min(2).max(50),
    shipmentId: idSchema.optional(),
    customerId: idSchema.optional(),
    vehicleId: idSchema.optional(),
    driverId: idSchema.optional(),
    status: z.enum(deliveryStatuses).optional(),
    deliveredAt: z.coerce.date().optional(),
    proofOfDeliveryUrl: z.string().url().optional(),
    recipientName: z.string().trim().max(120).optional(),
    recipientPhone: z.string().trim().max(30).optional(),
    notes: z.string().trim().max(1000).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateDeliverySchema = z.object({
  body: z
    .object({
      deliveryCode: z.string().trim().min(2).max(50).optional(),
      shipmentId: idSchema.optional(),
      customerId: idSchema.optional(),
      vehicleId: idSchema.optional(),
      driverId: idSchema.optional(),
      status: z.enum(deliveryStatuses).optional(),
      deliveredAt: z.coerce.date().optional(),
      proofOfDeliveryUrl: z.string().url().optional(),
      recipientName: z.string().trim().max(120).optional(),
      recipientPhone: z.string().trim().max(30).optional(),
      notes: z.string().trim().max(1000).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required."),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const deleteDeliverySchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});
