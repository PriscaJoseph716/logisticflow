import { z } from "zod";

const maintenanceStatuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "OVERDUE"] as const;
const maintenanceSortFields = [
  "maintenanceDate",
  "nextServiceDate",
  "nextServiceMileage",
  "currentMileage",
  "totalCost",
  "createdAt",
  "status",
] as const;
const idSchema = z.string().min(1);
const jsonSchema = z.record(z.string(), z.unknown());

const maintenancePartSchema = z.object({
  partName: z.string().trim().min(1).max(120),
  brand: z.string().trim().max(120).optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0).default(0),
  supplier: z.string().trim().max(120).optional(),
});

const maintenanceAttachmentSchema = z.object({
  category: z.string().trim().min(1).max(80),
  fileName: z.string().trim().min(1).max(255),
  fileUrl: z.string().url(),
  mimeType: z.string().trim().max(120).optional(),
});

export const listMaintenanceSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    search: z.string().trim().min(1).optional(),
    status: z.enum(maintenanceStatuses).optional(),
    vehicleId: idSchema.optional(),
    maintenanceType: z.string().trim().min(1).optional(),
    overdueOnly: z.coerce.boolean().optional(),
    upcomingOnly: z.coerce.boolean().optional(),
    serviceFrom: z.coerce.date().optional(),
    serviceTo: z.coerce.date().optional(),
    dueWithinDays: z.coerce.number().int().min(1).max(365).optional(),
    sortBy: z.enum(maintenanceSortFields).default("maintenanceDate"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
  params: z.object({}).passthrough(),
});

export const getMaintenanceSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const createMaintenanceSchema = z.object({
  body: z.object({
    vehicleId: idSchema,
    maintenanceDate: z.coerce.date(),
    maintenanceType: z.string().trim().min(2).max(120),
    workshop: z.string().trim().min(2).max(120),
    mechanic: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional(),
    currentMileage: z.coerce.number().int().min(0),
    laborCost: z.coerce.number().min(0).optional(),
    otherCost: z.coerce.number().min(0).optional(),
    nextServiceDate: z.coerce.date().optional(),
    nextServiceMileage: z.coerce.number().int().min(0).optional(),
    status: z.enum(maintenanceStatuses).optional(),
    timeline: jsonSchema.optional(),
    upcomingService: jsonSchema.optional(),
    parts: z.array(maintenancePartSchema).max(100).optional(),
    attachments: z.array(maintenanceAttachmentSchema).max(100).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateMaintenanceSchema = z.object({
  body: z
    .object({
      vehicleId: idSchema.optional(),
      maintenanceDate: z.coerce.date().optional(),
      maintenanceType: z.string().trim().min(2).max(120).optional(),
      workshop: z.string().trim().min(2).max(120).optional(),
      mechanic: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().max(1000).optional(),
      currentMileage: z.coerce.number().int().min(0).optional(),
      laborCost: z.coerce.number().min(0).optional(),
      otherCost: z.coerce.number().min(0).optional(),
      nextServiceDate: z.coerce.date().optional(),
      nextServiceMileage: z.coerce.number().int().min(0).optional(),
      status: z.enum(maintenanceStatuses).optional(),
      timeline: jsonSchema.optional(),
      upcomingService: jsonSchema.optional(),
      parts: z.array(maintenancePartSchema).max(100).optional(),
      attachments: z.array(maintenanceAttachmentSchema).max(100).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, "At least one field is required."),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const deleteMaintenanceSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    id: idSchema,
  }),
});

export const maintenanceAnalyticsSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    vehicleId: idSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
  params: z.object({}).passthrough(),
});

export const maintenanceReminderSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    vehicleId: idSchema.optional(),
    days: z.coerce.number().int().min(1).max(365).default(30),
    mileageThreshold: z.coerce.number().int().min(0).default(500),
  }),
  params: z.object({}).passthrough(),
});
